import { Injectable } from '@angular/core';
import { environment as env } from 'src/environments/environment';
import { of, Observable, throwError } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { AuthenticateComponent } from '../routes/auth/authenticate/authenticate.component';
import { ApiResponse, ApiService } from './api.service';
import { catchError, switchMap } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';

const SESSION_NAME = env.appName.toUpperCase() + '_SESSION';

export interface User {
	userId: number;
	fullName: string;
	employeeCode: string;
	occupationName: string;
	userImagePath: string;
	defaultRoute: string;
	functions: Array<string>;
	menus: Array<string>;
}

export interface Client {
	clientId: number;
	clientName: string;
	clientLogoPath: string;
	token: string;
	refreshToken: string;
}

// export interface Tokens {
// 	client: Client;
// 	token: string;
// 	refreshToken: string;
// }

@Injectable()
export class SessionService {

	constructor(
		private dialog: MatDialog,
		private apiService: ApiService,
		private router: Router
	) { }

	public get(key: string): any {
		const session = JSON.parse(localStorage.getItem(SESSION_NAME)) || {};
		return session[key];
	}

	public set(key: string, value: string): void {
		const session = JSON.parse(localStorage.getItem(SESSION_NAME)) || {};
		session[key] = value;
		localStorage.setItem(SESSION_NAME, JSON.stringify(session));
	}

	public delete(key: string): void {
		const session = JSON.parse(localStorage.getItem(SESSION_NAME)) || {};
		session[key] = null;
		delete session[key];
	}

	public clear(): void {
		localStorage.removeItem(SESSION_NAME);
	}

	setUser(user: User) {
		this.set('user', JSON.stringify(user));
	}

	getUser(): User {
		const user = this.get('user');
		if (!user) {
			return undefined;
		}
		return JSON.parse(user);
	}

	setClient(activeClient: Client) {
		this.set('client', JSON.stringify(activeClient));
	}

	getClient(): Client {
		const client = this.get('client');
		if (!client) {
			return undefined;
		}
		return JSON.parse(client);
	}

	// setClients(clients: Client[]) {
	// 	this.set('clients', JSON.stringify(clients));
	// }

	// getClients() {
	// 	const clients = this.get('clients');
	// 	if (!clients) {
	// 		return undefined;
	// 	}
	// 	return JSON.parse(clients);
	// }
	// setClient(client: Client) {
	// 	this.set('client', JSON.stringify(client));
	// }

	// getClient() {
	// 	const client = this.get('clients');
	// 	if (!client) {
	// 		return undefined;
	// 	}
	// 	return JSON.parse(client);
	// }

	// setTokens(tokens: Tokens) {
	// 	this.set('tokens', JSON.stringify(tokens))
	// }

	// setToken(token: string, refreshToken: string) {
	// 	const user: User = this.getUser();
	// 	if (user) {
	// 		user.token = token;
	// 		user.refreshToken = refreshToken;
	// 	}
	// 	this.setUser(user);
	// }

	// getTokens(): Tokens {
	// 	const client: Client = this.getCurrentClient
	// 	const tokens = this.get('tokens');
	// 	if (!tokens) {
	// 		return undefined;
	// 	}
	// 	return JSON.parse(tokens);
	// }

	// getClients(): Client[] {
	// 	const tokens: Tokens = this.getTokens();
	// 	if (!tokens) {
	// 		return undefined;
	// 	}
	// 	return tokens.token;
	// }

	setToken(token: string, refreshToken: string) {
		const client: Client = this.getClient();
		client.token = token;
		client.refreshToken = refreshToken;
		this.setClient(client);
	}

	getToken(): string {
		// const user: User = this.getUser();
		// if (!user) {
		// 	return undefined;
		// }
		// return user.token;
		const client: Client = this.getClient();
		if (!client) {
			return undefined;
		}
		return client.token;
	}

	getRefreshToken() {
		// const user: User = this.getUser();
		// if (!user) {
		// 	return undefined;
		// }
		// return user.refreshToken;
		// const tokens: Tokens = this.getTokens();
		// if (!tokens) {
		// 	return undefined;
		// }
		// return tokens.refreshToken;
		const client: Client = this.getClient();
		console.log(client);
		if (!client) {
			return undefined;
		}
		return client.refreshToken;
	}

	refreshToken() {
		const refreshToken = this.getRefreshToken();
		if (!refreshToken) {
			this.clear();
			this.router.navigateByUrl('/auth/login');
		}
		return this.apiService
			.post('/auth/refresh-token', {
				refreshToken
			})
			.pipe(
				switchMap((data: { token: string, refreshToken: string }) => {
					// TODO: Fix refresh tokens
					// this.setTokens(tokens);
					return of(data);
				})
			);
	}

	isTokenExpired() {
		const token = this.getToken();
		if (!token) {
			return true;
		}
		const helper = new JwtHelperService();
		return helper.isTokenExpired(token);
	}

	isAuth() {
		const user = this.getUser();
		return user !== undefined;
	}

	authenticate(): Promise<ApiResponse> {
		return new Promise<ApiResponse>((resolve, reject) => {
			this.dialog
				.open(AuthenticateComponent, {
					width: '300px',
					height: '256.5px'
				})
				.afterClosed()
				.subscribe(result => resolve(result), err => reject(err));
		});
	}

	hasMn(mn: string | Array<string>): boolean {
		const token = this.getToken();
		if (!token) {
			return false;
		}

		const helper = new JwtHelperService();
		const decodedToken = helper.decodeToken(token);
		const menus = decodedToken.mns || [];

		if (Array.isArray(mn)) {
			return (menus && mn.some(m => menus.includes(m))) ? true : false;
		}

		return (menus && menus.find((m: string) => m === mn)) ? true : false;
	}
}
