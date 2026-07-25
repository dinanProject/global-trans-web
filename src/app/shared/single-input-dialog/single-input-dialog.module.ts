import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SingleInputDialogComponent } from './single-input-dialog.component';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';



@NgModule({
	declarations: [
		SingleInputDialogComponent
	],
	imports: [
		CommonModule,
		MatDialogModule,
		MatDatepickerModule,
		FlexLayoutModule,
		ReactiveFormsModule,
		FormsModule
	]
})
export class SingleInputDialogModule { }
