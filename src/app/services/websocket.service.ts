import { Injectable, EventEmitter } from '@angular/core';
import { environment as env } from 'src/environments/environment';
import { Subject, Observable } from 'rxjs';
import { SessionService } from './session.service';

@Injectable({
	providedIn: 'root'
})
export class WebSocketService {

	ws: WebSocket;
	isConnected: boolean;
	isConnecting: boolean;

	onOpens: Array<any> = [];
	invokes: any = {};

	onOpen = new Subject();
	onError = new Subject();
	onClose = new Subject();

	websocketListener: any = {};
	websocketQueueListener: any = {};
	websocketCallback: any = {};
	websocketEvents: any = {

		invoke: (url, data, callId) => {
			this.invokes[url].call(this, data, callId);
		},

		broadcast: (namespace, url, data, logId, callId) => {
			// console.log(namespace);
			if (namespace && this.websocketListener[namespace] && this.websocketListener[namespace][url]) {
				this.websocketListener[namespace][url].next({
					data,
					logId,
					callId
				});
			} else {
				// console.log('Listener ' + namespace + ', url ' + url + ' not found');
			}
		},

		callback: (url, data, callId) => {
			const callback = this.websocketCallback[callId];
			if (!callback) {
				return;
			}
			callback.next(data);
			callback.complete();
			this.websocketCallback[callId] = null;
			delete this.websocketCallback[callId];
		},

		close: (url, data, callId) => {
			// if ($.isFunction(onCloseEvent)) {
			// onCloseEvent(data.code, data.reason);
			// }
		}
	};

	constructor(
		private sessionService: SessionService
	) { }

	init() {
		this.checkTokenExpiration()
			.subscribe(() => {
				this.connect();
			});
	}

	connect() {
		let timeout: NodeJS.Timeout;

		const params = {
			apiKey: env.apiKey,
			id: this.uuid(),
			ver: require('../../../package.json').version,
			token: ''
		};

		params.token = this.sessionService.getToken() || '';

		let query = '';
		for (const field of Object.keys(params)) {
			if (query !== '') {
				query += '&';
			}
			query += field + '=' + encodeURIComponent(params[field]);
		}

		console.log('Connecting..');

		this.ws = new WebSocket(env.wsUrl + '?' + query);
		// this.ws = new WebSocket(`ws://localhost:15011/api?${query}`);
		this.isConnecting = true;
		this.ws.onopen = () => {
			clearTimeout(timeout);
			this.isConnecting = false;
			this.isConnected = true;
			this.listenQueue();
			this.relisten();
			this.onOpen.next();
		};

		this.ws.onerror = (error) => {
			console.log('Websocket error', error);
			this.onError.next(error);
		};

		this.ws.onclose = (reason) => {
			console.log('Websocket Disconnected', reason);
			this.isConnected = false;
			this.onClose.next(reason);
			timeout = setTimeout(() => {
				console.log('Reconnecting..');
				this.connect();
			}, 3000);
		};

		this.ws.onmessage = (message) => {
			const utfData = message.data;
			const jsonData = JSON.parse(utfData);
			const event = jsonData.event;
			if (!event) {
				console.log('Undefined event');
				return;
			}
			const url = jsonData.url;
			const data = jsonData.data;
			const callId = jsonData.callId || 0;
			if (event === 'broadcast') {
				const namespace = jsonData.namespace;
				const logId = jsonData.logId;
				this.websocketEvents[event].call(this.ws, namespace, url, data, logId, callId);
			} else {
				this.websocketEvents[event].call(this.ws, url, data, callId);
			}
		};
	}

	private uuid() {
		const lut = []; for (let i = 0; i < 256; i++) { lut[i] = (i < 16 ? '0' : '') + (i).toString(16); }
		// tslint:disable:no-bitwise
		const d0 = Math.random() * 0xffffffff | 0;
		const d1 = Math.random() * 0xffffffff | 0;
		const d2 = Math.random() * 0xffffffff | 0;
		const d3 = Math.random() * 0xffffffff | 0;
		return lut[d0 & 0xff] + lut[d0 >> 8 & 0xff] + lut[d0 >> 16 & 0xff] + lut[d0 >> 24 & 0xff] + '-' +
			lut[d1 & 0xff] + lut[d1 >> 8 & 0xff] + '-' + lut[d1 >> 16 & 0x0f | 0x40] + lut[d1 >> 24 & 0xff] + '-' +
			lut[d2 & 0x3f | 0x80] + lut[d2 >> 8 & 0xff] + '-' + lut[d2 >> 16 & 0xff] + lut[d2 >> 24 & 0xff] +
			lut[d3 & 0xff] + lut[d3 >> 8 & 0xff] + lut[d3 >> 16 & 0xff] + lut[d3 >> 24 & 0xff];
	}

	send(event, url, data, callId): Observable<any> {
		if (!this.isConnected) {
			alert(`Websocket not connected (event: '${event}, url: '${url}')`);
			return;
		}
		const message = {
			event,
			url,
			data: data || {},
			callId
		};

		const callback = new Subject();
		this.websocketCallback[callId] = callback;
		this.ws.send(JSON.stringify(message));
		return callback.asObservable();
	}

	invoke(url, data): Observable<any> {
		const callId = 'cid-' + this.uuid();
		return this.send('invoke', url, data, callId);
	}

	listenQueue() {
		if (Object.keys(this.websocketQueueListener).length > 0) {
			for (const namespace of Object.keys(this.websocketQueueListener)) {
				for (const url of Object.keys(this.websocketQueueListener[namespace])) {
					this._listen(namespace, url, this.websocketQueueListener[namespace][url]);
				}
			}
		} else {
			console.log('No queued listener found');
		}
	}

	_listen(namespace, url, subject) {
		const callId = 'cid-' + this.uuid();
		this.send('listen', url, {
			namespace
		}, callId).subscribe(data => {
			if (data.status && data.status === 'success') {
				if (!this.websocketListener[namespace]) {
					this.websocketListener[namespace] = {};
				}
				this.websocketListener[namespace][url] = subject;
			}
		});
	}

	listen(namespace, url) {
		const subject = new Subject();
		if (!this.isConnected) {
			// add to queue
			if (!this.websocketQueueListener[namespace]) {
				this.websocketQueueListener[namespace] = {};
			}
			this.websocketQueueListener[namespace][url] = subject;
		} else {
			// listen
			this._listen(namespace, url, subject);
		}
		return subject;
	}

	unlisten(namespace, url) {
		const callId = 'cid-' + this.uuid();

		this.send('unlisten', url, {
			namespace
		}, callId).subscribe(data => {
			if (data.status && data.status === 'success') {
				if (this.websocketListener[namespace] && this.websocketListener[namespace][url]) {
					this.websocketListener[namespace][url] = {};
					delete this.websocketListener[namespace][url];
				}
			}
		});
	}

	relisten() {
		const callId = 'cid-' + this.uuid();
		if (Object.keys(this.websocketListener).length > 0) {
			for (const namespace of Object.keys(this.websocketListener)) {
				for (const url of Object.keys(this.websocketListener[namespace])) {
					// console.log(`Relistening to namespace '${namespace}', url '${url}'`);
					this.send('listen', url, {
						namespace
					}, callId).subscribe(data => {
						if (data.status && data.status === 'success') {
							// console.log('listeners', this.websocketListener);
						}
					});
				}
			}
		} else {
			console.log('Not listening to any namespace');
		}
	}

	// clearListener() {
	// 	for (const x of Object.keys(this.listens)) {
	// 		for (const y of Object.keys(this.listens[x])) {
	// 			this.unlisten(x, y);
	// 		}
	// 	}
	// }

	checkTokenExpiration() {
		return new Observable((observer) => {
			if (!this.sessionService.isAuth() || !this.sessionService.isTokenExpired()) {
				observer.next();
			} else {
				this.sessionService.refreshToken()
					.subscribe(() => {
						observer.next();
					});
			}
		});
	}
}
