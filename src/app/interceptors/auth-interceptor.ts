import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { filter, take, switchMap, catchError } from 'rxjs/operators';
import { environment as env } from 'src/environments/environment';
import { SessionService } from '../services/session.service';
import { ActivatedRoute, Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
	private refreshTokenInProgress = false;
	private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(
		null
	);

	constructor(
		private activatedRoute: ActivatedRoute,
		private sessionService: SessionService
	) { }

	intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

		const headersConfig: any = {
			Accept: 'application/json',
			'Api-Key': env.apiKey
		};

		if (request.headers.has('Content-Type')) {
			headersConfig['Content-Type'] = request.headers.get('Content-Type');
		}

		request = request.clone({
			setHeaders: headersConfig
		});

		/**
		 * INI UNTUK QUERY TOKEN -> TOKEN YANG DI INJECT DI URL
		 */
		const queryToken = this.activatedRoute.snapshot.queryParamMap.get('token');
		if (queryToken) {
			return next.handle(this.injectQueryToken(request));
		}

		if (!this.sessionService.getToken()) {
			return next.handle(request);
		}

		if (request.url.includes('auth/login') || request.url.includes('auth/refresh-token')) {
			return next.handle(request);
		}

		const tokenExpired = this.sessionService.isTokenExpired();
		if (tokenExpired) {
			if (!this.refreshTokenInProgress) {
				this.refreshTokenInProgress = true;
				this.refreshTokenSubject.next(null);
				return this.sessionService.refreshToken()
					.pipe(
						switchMap((tokens: any) => {
							this.refreshTokenInProgress = false;
							this.refreshTokenSubject.next(tokens.refreshToken);
							return next.handle(this.injectToken(request));
						})
					);
			} else {
				return this.refreshTokenSubject.pipe(
					filter(result => result !== null),
					take(1),
					switchMap(() => {
						return next.handle(this.injectToken(request))
					})
				);
			}
		} else {
			return next.handle(this.injectToken(request));
		}

	}

	private injectToken(request: HttpRequest<any>) {
		const token = this.sessionService.getToken();
		return request.clone({
			headers: request.headers.set('Authorization', token)
		});
	}

	private injectQueryToken(request: HttpRequest<any>) {
		const token = this.activatedRoute.snapshot.queryParamMap.get('token');
		const helper = new JwtHelperService();
		return request.clone({
			headers: request.headers.set('Authorization', token)
		});
	}
}
