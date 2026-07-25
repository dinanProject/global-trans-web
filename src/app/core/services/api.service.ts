import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment as env } from 'src/environments/environment';

export interface ApiResponse<T = unknown> {
	meta: {
		timestamp: number;
		message: string;
	};
	dataType: string;
	data: T;
	message?: string;
	additionalData?: unknown;
}

@Injectable({
	providedIn: 'root',
})
export class ApiService {
	constructor(private http: HttpClient) {}

	post<T>(path: string, data: unknown = {}): Observable<T> {
		return this.http.post<ApiResponse<T>>(this.buildUrl(path), data).pipe(
			map((result) => result.data),
			catchError((error) => throwError(() => error)),
		);
	}

	get<T>(path: string, params: HttpParams = new HttpParams()): Observable<T> {
		return this.http
			.get<ApiResponse<T>>(this.buildUrl(path), { params })
			.pipe(
				map((result) => result.data),
				catchError((error) => throwError(() => error)),
			);
	}

	put<T>(path: string, body: unknown = {}): Observable<T> {
		return this.http.put<ApiResponse<T>>(this.buildUrl(path), body).pipe(
			map((result) => result.data),
			catchError((error) => throwError(() => error)),
		);
	}

	delete<T>(path: string, body: unknown = {}): Observable<T> {
		return this.http
			.delete<ApiResponse<T>>(this.buildUrl(path), { body })
			.pipe(
				map((result) => result.data),
				catchError((error) => throwError(() => error)),
			);
	}

	upload<T>(path: string, file: FormData, update = false): Observable<T> {
		const request$ = update
			? this.http.put<ApiResponse<T>>(this.buildUrl(path), file)
			: this.http.post<ApiResponse<T>>(this.buildUrl(path), file);

		return request$.pipe(
			map((result) => result.data),
			catchError((error) => throwError(() => error)),
		);
	}

	private buildUrl(path: string): string {
		const normalizedPath = path.startsWith('/') ? path : `/${path}`;

		return `${env.apiUrl}${normalizedPath}`;
	}
}
