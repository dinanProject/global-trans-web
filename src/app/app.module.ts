import {
	BrowserModule,
	HammerGestureConfig,
	HammerModule,
	HAMMER_GESTURE_CONFIG,
} from '@angular/platform-browser';
import { Injectable, LOCALE_ID, NgModule } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeId from '@angular/common/locales/id';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import * as Hammer from 'hammerjs';

import {
	NgxCurrencyInputMode,
	provideEnvironmentNgxCurrency,
} from 'ngx-currency';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { UiModule } from './shared/ui.module';

import { UnauthorizedComponent } from './routes/public/unauthorized.component';
import { AuthInterceptor } from './core/interceptors/auth-interceptor';

registerLocaleData(localeId, 'id');

const currencyConfig = {
	align: 'right',
	allowNegative: false,
	allowZero: true,
	decimal: ',',
	precision: 0,
	prefix: 'Rp ',
	suffix: '',
	thousands: '.',
	nullable: true,
	min: 0,
	max: 999999999999,
	inputMode: NgxCurrencyInputMode.Natural,
};

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

@NgModule({ declarations: [AppComponent, UnauthorizedComponent],
    bootstrap: [AppComponent], imports: [BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        HammerModule,
        UiModule], providers: [
        provideEnvironmentNgxCurrency(currencyConfig),
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
        provideHttpClient(withInterceptorsFromDi()),
    ] })
export class AppModule {}
