import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SalesRegistrationRoutingModule } from './sales-registration-routing.module';
import { SalesRegistrationComponent } from './sales-registration.component';
import { UiModule } from 'src/app/modules/ui.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LinkComponent } from './link/link.component';
import { QRCodeModule } from 'angularx-qrcode';


@NgModule({
	declarations: [
		SalesRegistrationComponent,
		LinkComponent
	],
	imports: [
		CommonModule,
		SalesRegistrationRoutingModule,
		UiModule,
		FormsModule,
		ReactiveFormsModule,
		QRCodeModule
	]
})
export class SalesRegistrationModule { }
