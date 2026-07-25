import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertModule } from './alert/alert.module';
import { ConfirmModule } from './confirm/confirm.module';

@NgModule({
	declarations: [

	],
	imports: [
		CommonModule,
		AlertModule,
		ConfirmModule
	]
})
export class UtilityModule { }
