import { BrowserModule, HammerGestureConfig, HammerModule, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { LOCALE_ID, Injectable, NgModule } from '@angular/core';
import localeId from '@angular/common/locales/id';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SessionService } from './services/session.service';
import { ApiService } from './services/api.service';
import { WebSocketService } from './services/websocket.service';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { UiModule } from './modules/ui.module';
import { NotFoundComponent } from './routes/frontend/not-found.component';
import { UnauthorizedComponent } from './routes/frontend/unauthorized.component';
import { AuthInterceptor } from './interceptors/auth-interceptor';
import * as Hammer from 'hammerjs';
import { registerLocaleData } from '@angular/common';
import { CurrencyMaskConfig, NgxCurrencyModule } from 'ngx-currency';
import { UtilityService } from './services/utility.service';
import { RevisionComponent } from './src/app/routes/backend/sales-administration/sales-transaction/detail/revision/revision.component';

registerLocaleData(localeId, 'id');

@Injectable()
export class PatchedGestureConfig extends HammerGestureConfig {
	overrides: any = {
		pinch: {
			direction: Hammer.DIRECTION_ALL,
			enable: true
		},
		pan: {
			direction: Hammer.DIRECTION_ALL,
			requireFailure: ['pinch'],
			threshold: 2
		},
		swipe: {
			direction: Hammer.DIRECTION_ALL,
			enable: true
		}
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
	nullable: true
};

@NgModule({
	declarations: [
		AppComponent,
		NotFoundComponent,
		UnauthorizedComponent,
  RevisionComponent
	],
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
			multi: true
		},
		// {
		// 	provide: HTTP_INTERCEPTORS,
		// 	useClass: UserRegistrationInterceptor,
		// 	multi: true
		// },
		{
			provide: LOCALE_ID, useValue: 'id'
		},
		{
			provide: HAMMER_GESTURE_CONFIG,
			useClass: PatchedGestureConfig
		},
		ApiService,
		SessionService,
		UtilityService,
		WebSocketService
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
