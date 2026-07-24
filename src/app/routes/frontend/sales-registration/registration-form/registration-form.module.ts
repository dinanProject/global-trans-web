import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RegistrationFormRoutingModule } from './registration-form-routing.module';
import { RegistrationFormComponent } from './registration-form.component';
import { UiModule } from 'src/app/modules/ui.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DirectiveModule } from 'src/app/directives/directive.module';


@NgModule({
	declarations: [
		RegistrationFormComponent
	],
	imports: [
		CommonModule,
		RegistrationFormRoutingModule,
		UiModule,
		FormsModule,
		ReactiveFormsModule,
		DirectiveModule
	]
})
export class RegistrationFormModule { }
