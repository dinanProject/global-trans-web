import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertComponent } from './alert.component';
import { MatDialogModule } from '@angular/material/dialog';
import { FlexLayoutModule } from '@angular/flex-layout';



@NgModule({
	declarations: [
		AlertComponent
	],
	imports: [
		CommonModule,
		MatDialogModule,
		FlexLayoutModule
	]
})
export class AlertModule { }
