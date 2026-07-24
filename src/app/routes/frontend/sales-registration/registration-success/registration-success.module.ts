import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RegistrationSuccessRoutingModule } from './registration-success-routing.module';
import { RegistrationSuccessComponent } from './registration-success.component';
import { UiModule } from 'src/app/modules/ui.module';


@NgModule({
	declarations: [
		RegistrationSuccessComponent
	],
	imports: [
		CommonModule,
		RegistrationSuccessRoutingModule,
		UiModule
	]
})
export class RegistrationSuccessModule { }
