import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './login/login.component';
import { UiModule } from 'src/app/shared/ui.module';

@NgModule({
	declarations: [LoginComponent],
	imports: [CommonModule, ReactiveFormsModule, AuthRoutingModule, UiModule],
})
export class AuthModule {}
