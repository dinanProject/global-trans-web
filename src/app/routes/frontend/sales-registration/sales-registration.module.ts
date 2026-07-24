import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SalesRegistrationRoutingModule } from './sales-registration-routing.module';
import { SalesRegistrationComponent } from './sales-registration.component';
import { UiModule } from 'src/app/modules/ui.module';


@NgModule({
	declarations: [
		SalesRegistrationComponent
	],
	imports: [
		CommonModule,
		SalesRegistrationRoutingModule,
		UiModule
	]
})
export class SalesRegistrationModule { }
