import { Component, OnInit } from '@angular/core';
import { WebSocketService } from './services/websocket.service';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

	title = 'Raya';

	constructor(

	) { }

	ngOnInit(): void {
		// this.websocketService.connect();

		// this.websocketService.onOpen.subscribe(() => {
		// 	console.log('Websocket connected');
		// });

		// this.websocketService.onError.subscribe(() => {
		// 	console.log('Websocket error');
		// });

		// this.websocketService.onClose.subscribe(() => {
		// 	console.log('Websocket closed');
		// });
	}
}
