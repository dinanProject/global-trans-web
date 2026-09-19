import './polyfills';

import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

import 'hammerjs';
import 'hammer-timejs';

const storedTheme = (() => {
	try {
		return localStorage.getItem('global-trans-theme') === 'dark'
			? 'dark'
			: 'light';
	} catch {
		return 'light';
	}
})();

const isLoginRoute = window.location.pathname.startsWith('/auth/login');

document.documentElement.setAttribute(
	'data-theme',
	isLoginRoute ? 'light' : storedTheme,
);

if (environment.production) {
	enableProdMode();
}

platformBrowserDynamic()
	.bootstrapModule(AppModule)
	.catch((err) => console.error(err));
