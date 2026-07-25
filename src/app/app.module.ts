import {
	BrowserModule,
	HammerGestureConfig,
	HammerModule,
	HAMMER_GESTURE_CONFIG,
} from '@angular/platform-browser';
import { Injectable, LOCALE_ID, NgModule } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeId from '@angular/common/locales/id';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import * as Hammer from 'hammerjs';
import { CurrencyMaskConfig, NgxCurrencyModule } from 'ngx-currency';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { UiModule } from './shared/ui.module';

import { NotFoundComponent } from './routes/public/not-found.component';
import { UnauthorizedComponent } from './routes/public/unauthorized.component';

import { AuthInterceptor } from './core/interceptors/auth-interceptor';

registerLocaleData(localeId, 'id');

@Injectable()
export class PatchedGestureConfig extends HammerGestureConfig {
	overrides: any = {
		pinch: {
			direction: Hammer.DIRECTION_ALL,
			enable: true,
		},
		pan: {
			direction: Hammer.DIRECTION_ALL,
			requireFailure: ['pinch'],
			threshold: 2,
		},
		swipe: {
			direction: Hammer.DIRECTION_ALL,
			enable: true,
		},
	};
}

export const customCurrencyMaskConfig: CurrencyMaskConfig = {
	align: 'right',
	allowNegative: true,
	allowZero: true,
	decimal: ',',
	precision: 0,
	prefix: '',
	suffix: '',
	thousands: '.',
	nullable: true,
};

@NgModule({
	declarations: [AppComponent, UnauthorizedComponent],
	imports: [
		BrowserModule,
		AppRoutingModule,
		BrowserAnimationsModule,
		HttpClientModule,
		HammerModule,
		UiModule,
		NgxCurrencyModule.forRoot(customCurrencyMaskConfig),
	],
	providers: [
		{
			provide: HTTP_INTERCEPTORS,
			useClass: AuthInterceptor,
			multi: true,
		},
		{
			provide: LOCALE_ID,
			useValue: 'id',
		},
		{
			provide: HAMMER_GESTURE_CONFIG,
			useClass: PatchedGestureConfig,
		},
	],
	bootstrap: [AppComponent],
})
export class AppModule {}
