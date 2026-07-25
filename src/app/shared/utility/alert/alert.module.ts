import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertComponent } from './alert.component';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
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
