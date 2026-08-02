import { Injectable } from '@angular/core';
import {
	HttpErrorResponse,
	HttpEvent,
	HttpHandler,
	HttpInterceptor,
	HttpRequest,
} from '@angular/common/http';
import { Router } from '@angular/router';

import { BehaviorSubject, Observable, throwError } from 'rxjs';

import { catchError, filter, finalize, switchMap, take } from 'rxjs/operators';

import {
	RefreshTokenResponse,
	SessionService,
} from '../services/session.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
	private isRefreshing = false;

	private readonly refreshTokenSubject = new BehaviorSubject<string | null>(
		null,
	);

	constructor(
		private sessionService: SessionService,
		private router: Router,
	) {}

	intercept(
		request: HttpRequest<unknown>,
		next: HttpHandler,
	): Observable<HttpEvent<unknown>> {
		const token = this.sessionService.getToken();
		const authenticatedRequest = this.addToken(request, token);

		return next.handle(authenticatedRequest).pipe(
			catchError((error: HttpErrorResponse) => {
				console.log('[AuthInterceptor] error:', {
					url: request.url,
					status: error.status,
					error: error.error,
				});
				if (this.isPublicAuthRequest(request)) {
					return throwError(() => error);
				}

				if (!this.isUnauthorizedError(error)) {
					return throwError(() => error);
				}

				return this.handleUnauthorized(request, next);
			}),
		);
	}

	private handleUnauthorized(
		request: HttpRequest<unknown>,
		next: HttpHandler,
	): Observable<HttpEvent<unknown>> {
		if (!this.isRefreshing) {
			this.isRefreshing = true;
			this.refreshTokenSubject.next(null);

			return this.sessionService.refreshToken().pipe(
				switchMap((response: RefreshTokenResponse) => {
					const accessToken = response.accessToken;

					this.refreshTokenSubject.next(accessToken);

					return next.handle(this.addToken(request, accessToken));
				}),
				catchError((error: HttpErrorResponse) => {
					this.sessionService.logoutLocal('session-expired');

					return throwError(() => error);
				}),
				finalize(() => {
					this.isRefreshing = false;
				}),
			);
		}

		return this.refreshTokenSubject.pipe(
			filter((token): token is string => token !== null),
			take(1),
			switchMap((token) => next.handle(this.addToken(request, token))),
		);
	}

	private isUnauthorizedError(error: HttpErrorResponse): boolean {
		const code =
			error?.error?.code ??
			error?.error?.meta?.code ??
			error?.error?.meta?.errorCode;

		const message =
			error?.error?.message ?? error?.error?.meta?.message ?? '';

		return (
			error.status === 401 ||
			code === 'TOKEN_EXPIRED' ||
			String(message)
				.toLowerCase()
				.includes('access token sudah kedaluwarsa')
		);
	}

	private addToken(
		request: HttpRequest<unknown>,
		token: string | null,
	): HttpRequest<unknown> {
		if (!token) {
			return request;
		}

		return request.clone({
			setHeaders: {
				Authorization: `Bearer ${token}`,
			},
		});
	}

	private isPublicAuthRequest(request: HttpRequest<unknown>): boolean {
		return (
			request.url.includes('/auth/login') ||
			request.url.includes('/auth/refresh-token')
		);
	}
}
