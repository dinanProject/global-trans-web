import { Injectable } from '@angular/core';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { environment as env } from 'src/environments/environment';
import { Session } from '../models/session.model';
import { User } from '../models/user.model';

export interface RefreshTokenResponse {
	accessToken: string;
	refreshToken: string;
}

interface ApiResponse<T> {
	meta: {
		timestamp: number;
		message: string;
	};
	dataType: string;
	data: T;
}

const SESSION_NAME = `${env.appName.toUpperCase()}_SESSION`;

@Injectable({
	providedIn: 'root',
})
export class SessionService {
	private readonly http: HttpClient;

	constructor(
		httpBackend: HttpBackend,
		private router: Router,
	) {
		/*
		 * HttpClient ini melewati HttpBackend secara langsung.
		 * Request refresh tidak masuk lagi ke AuthInterceptor.
		 */
		this.http = new HttpClient(httpBackend);
	}

	setSession(session: Session): void {
		localStorage.setItem(SESSION_NAME, JSON.stringify(session));
	}

	getSession(): Session | null {
		const rawSession = localStorage.getItem(SESSION_NAME);

		if (!rawSession) {
			return null;
		}

		try {
			return JSON.parse(rawSession) as Session;
		} catch {
			this.clear();
			return null;
		}
	}

	setUser(user: User): void {
		const session = this.getSession();

		if (!session) {
			return;
		}

		this.setSession({
			...session,
			user,
		});
	}

	getUser(): User | null {
		return this.getSession()?.user ?? null;
	}

	setTokens(accessToken: string, refreshToken: string): void {
		const session = this.getSession();

		if (!session) {
			return;
		}

		this.setSession({
			...session,
			accessToken,
			refreshToken,
		});
	}

	getToken(): string | null {
		return this.getSession()?.accessToken ?? null;
	}

	getRefreshToken(): string | null {
		return this.getSession()?.refreshToken ?? null;
	}

	isAuth(): boolean {
		return Boolean(
			this.getUser() && this.getToken() && this.getRefreshToken(),
		);
	}

	isTokenExpired(): boolean {
		const token = this.getToken();

		if (!token) {
			return true;
		}

		const helper = new JwtHelperService();

		return helper.isTokenExpired(token);
	}

	refreshToken(): Observable<RefreshTokenResponse> {
		const refreshToken = this.getRefreshToken();

		if (!refreshToken) {
			this.logoutLocal();

			return throwError(
				() => new Error('Refresh token is not available'),
			);
		}

		return this.http
			.post<ApiResponse<RefreshTokenResponse>>(
				`${env.apiUrl}/auth/refresh-token`,
				{
					refreshToken,
				},
			)
			.pipe(
				map((result) => result.data),
				tap((response) => {
					this.setTokens(response.accessToken, response.refreshToken);
				}),
				catchError((error) => {
					this.logoutLocal();

					return throwError(() => error);
				}),
			);
	}

	setAccess(roleCodes: string[], permissionCodes: string[]): void {
		const session = this.getSession();

		if (!session) {
			return;
		}

		this.setSession({
			...session,
			roleCodes,
			permissionCodes,
		});
	}

	getRoleCodes(): string[] {
		return this.getSession()?.roleCodes ?? [];
	}

	getPermissionCodes(): string[] {
		return this.getSession()?.permissionCodes ?? [];
	}

	hasRole(roleCode: string): boolean {
		return this.getRoleCodes().includes(roleCode);
	}

	hasPermission(permissionCode: string): boolean {
		return this.getPermissionCodes().includes(permissionCode);
	}

	isSystemDeveloper(): boolean {
		return this.hasRole('SYSTEM_DEVELOPER');
	}

	clear(): void {
		localStorage.removeItem(SESSION_NAME);
	}

	logoutLocal(): void {
		this.clear();

		if (this.router.url !== '/auth/login') {
			this.router.navigateByUrl('/auth/login');
		}
	}
}
