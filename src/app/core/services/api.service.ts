import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment as env } from 'src/environments/environment';

interface ApiResponse {
	meta: {
		timestamp: number;
		message: string;
	};
	dataType: string;
	data: any;
	message?: string;
	additionalData?: any;
}

@Injectable({
	providedIn: 'root',
})
export class ApiService {
	constructor(
		public http: HttpClient,
		public router: Router,
	) {}

	post(path: string, data: any = {}): Observable<any> {
		return this.http.post<ApiResponse>(this.buildUrl(path), data).pipe(
			map((result) => result.data),
			catchError((error) => throwError(() => error)),
		);
	}

	get(path: string, params: HttpParams = new HttpParams()): Observable<any> {
		return this.http.get<ApiResponse>(this.buildUrl(path), { params }).pipe(
			map((result) => result.data),
			catchError((error) => throwError(() => error)),
		);
	}

	getBlob(
		path: string,
		params: HttpParams = new HttpParams(),
	): Observable<any> {
		return this.http.get(this.buildUrl(path), {
			params,
			responseType: 'blob',
		});
	}

	put(path: string, body: any = {}): Observable<any> {
		return this.http.put<ApiResponse>(this.buildUrl(path), body).pipe(
			map((result) => result.data),
			catchError((error) => throwError(() => error)),
		);
	}

	delete(path: string, body: any = {}): Observable<any> {
		return this.http
			.delete<ApiResponse>(this.buildUrl(path), { body })
			.pipe(
				map((result) => result.data),
				catchError((error) => throwError(() => error)),
			);
	}

	upload(path: string, file: any, update = false): Observable<any> {
		const request$ = update
			? this.http.put<ApiResponse>(this.buildUrl(path), file)
			: this.http.post<ApiResponse>(this.buildUrl(path), file);

		return request$.pipe(
			map((result) => result.data),
			catchError((error) => throwError(() => error)),
		);
	}

	throwError(err: any): Promise<boolean> {
		return Promise.reject(err);
	}

	private buildUrl(path: string): string {
		const normalizedPath = path.startsWith('/') ? path : `/${path}`;

		return `${env.apiUrl}${normalizedPath}`;
	}
}
