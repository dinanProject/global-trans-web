import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './login/login.component';
import { LogoutComponent } from './logout/logout.component';
import { AuthenticateComponent } from './authenticate/authenticate.component';
import { UiModule } from 'src/app/modules/ui.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from 'src/app/interceptors/auth-interceptor';
import { ApiService } from 'src/app/services/api.service';
import { SessionService } from 'src/app/services/session.service';


@NgModule({
	declarations: [LoginComponent, LogoutComponent, AuthenticateComponent],
	imports: [
		CommonModule,
		AuthRoutingModule,
		UiModule,
		FormsModule,
		ReactiveFormsModule
	],
	providers: [
		{
			provide: HTTP_INTERCEPTORS,
			useClass: AuthInterceptor,
			multi: true
		},
		ApiService,
		SessionService,
	]
})
export class AuthModule { }
