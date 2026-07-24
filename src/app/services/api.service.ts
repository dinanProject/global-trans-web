import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment as env } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ActivatedRoute, Route, Router } from '@angular/router';

export interface ApiResponse {
	meta: any;
	dataType: string;
	data?: any;
	message?: string;
	additionalData?: any;
}

@Injectable()
export class ApiService {

	constructor(
		private http: HttpClient,
		private activatedRoute: ActivatedRoute,
		private router: Router,) { }

	public post(path: string, data: any = {}): Observable<any> {
		return this.http
			.post<ApiResponse>(`${env.apiUrl}${path}`, JSON.stringify(data), {
				headers: {
					'Content-Type': 'application/json'
				}
			})
			.pipe(
				map(result => result.data),
				catchError(err => this.throwError(err))
			);
	}

	public get(path: string, params: HttpParams = new HttpParams()): Observable<any> {
		return this.http
			.get<ApiResponse>(`${env.apiUrl}${path}`, {
				params,
				headers: {
					'Content-Type': 'application/json'
				}
			})
			.pipe(
				map(result => result.data),
				catchError(err => this.throwError(err))
			);
	}

	public put(path: string, body: any = {}): Observable<any> {
		return this.http
			.put<ApiResponse>(`${env.apiUrl}${path}`, JSON.stringify(body), {
				headers: {
					'Content-Type': 'application/json'
				}
			})
			.pipe(
				map(result => result.data),
				catchError(err => this.throwError(err))
			);
	}

	public delete(path: string, body: any = {}): Observable<any> {
		return this.http
			.delete<ApiResponse>(`${env.apiUrl}${path}`, {
				headers: {
					'Content-Type': 'application/json'
				},
				body
			})
			.pipe(
				map(result => result.data),
				catchError(err => this.throwError(err))
			);
	}

	public upload(path: string, file: any, update: boolean = false): Observable<any> {
		if (!update) {
			return this.http
				.post<ApiResponse>(`${env.apiUrl}${path}`, file)
				.pipe(
					map(result => result.data),
					catchError(err => this.throwError(err))
				);
		}

		return this.http
			.put<ApiResponse>(`${env.apiUrl}${path}`, file)
			.pipe(
				map(result => result.data),
				catchError(err => this.throwError(err))
			);
	}

	throwError(err) {
		if (err.status === 498) {
			const returnUrl = this.activatedRoute.snapshot.queryParams.returnUrl || '';
			return this.router.navigate(['/auth/logout'], {
				queryParams: { returnUrl }
			});
		} else {
			throw err;
		}
	}
}
