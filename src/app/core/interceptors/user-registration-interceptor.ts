import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment as env } from 'src/environments/environment';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { catchError, filter, map } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable()
export class UserRegistrationInterceptor implements HttpInterceptor {

	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router
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

		const token = this.activatedRoute.snapshot.queryParamMap.get('token');
		if (!token) {
			return next.handle(request);
		}

		const helper = new JwtHelperService();
		const tokenExpired = helper.isTokenExpired(token);
		if (tokenExpired) {
			this.router.navigate(['/unauthorized-access']);
			return throwError('Token expired');
		} else {
			return next.handle(this.injectToken(request));
		}
	}

	private injectToken(request: HttpRequest<any>) {
		const token = this.activatedRoute.snapshot.queryParamMap.get('token');
		return request.clone({
			headers: request.headers.set('Authorization', token)
		});
	}
}
