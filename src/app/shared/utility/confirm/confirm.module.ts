import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmComponent } from './confirm.component';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';



@NgModule({
	declarations: [
		ConfirmComponent
	],
	imports: [
		CommonModule,
		MatDialogModule,
		FlexLayoutModule,
		FormsModule,
		ReactiveFormsModule
	]
})
export class ConfirmModule { }
