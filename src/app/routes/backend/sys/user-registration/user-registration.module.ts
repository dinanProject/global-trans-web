import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserRegistrationRoutingModule } from './user-registration-routing.module';
import { UserRegistrationComponent } from './user-registration.component';
import { DetailComponent } from './detail/detail.component';
import { LinkComponent } from './link/link.component';
import { UiModule } from 'src/app/modules/ui.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QRCodeModule } from 'angularx-qrcode';

@NgModule({
	declarations: [
		UserRegistrationComponent,
		DetailComponent,
		LinkComponent
	],
	imports: [
		CommonModule,
		UserRegistrationRoutingModule,
		UiModule,
		FormsModule,
		ReactiveFormsModule,
		QRCodeModule
	]
})
export class UserRegistrationModule { }
