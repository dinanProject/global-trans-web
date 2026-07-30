import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './login/login.component';
import { LoadingButtonModule } from 'src/app/shared/loading-button/loading-button.module';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
	declarations: [LoginComponent],
	imports: [
		CommonModule,
		ReactiveFormsModule,
		LoadingButtonModule,
		AuthRoutingModule,
	],
})
export class AuthModule {}
