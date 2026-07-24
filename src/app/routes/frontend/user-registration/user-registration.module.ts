import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserRegistrationRoutingModule } from './user-registration-routing.module';
import { UserRegistrationComponent } from './user-registration.component';
import { UiModule } from 'src/app/modules/ui.module';

@NgModule({
	declarations: [
		UserRegistrationComponent
	],
	imports: [
		CommonModule,
		UserRegistrationRoutingModule,
		UiModule
	]
})
export class UserRegistrationModule { }
