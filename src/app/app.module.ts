import { BrowserModule } from '@angular/platform-browser';
import { LOCALE_ID, NgModule } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeId from '@angular/common/locales/id';
import {
	HTTP_INTERCEPTORS,
	provideHttpClient,
	withInterceptorsFromDi,
} from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import {
	NgxCurrencyInputMode,
	provideEnvironmentNgxCurrency,
} from 'ngx-currency';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { UiModule } from './shared/ui.module';
import { PublicModule } from './routes/public/public.module';
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

@NgModule({
	declarations: [AppComponent],
	imports: [BrowserModule, AppRoutingModule, UiModule, PublicModule],
	providers: [
		provideAnimations(),
		provideHttpClient(withInterceptorsFromDi()),
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
	],
	bootstrap: [AppComponent],
})
export class AppModule {}
