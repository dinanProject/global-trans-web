import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OptionDialogComponent, OptionDirective, } from './option-dialog.component';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import { SingleInputDialogModule } from '../single-input-dialog/single-input-dialog.module';
import { DialogComponent } from './dialog/dialog.component';
import { LoadingModule } from '../loading/loading.module';



@NgModule({
	declarations: [
		OptionDialogComponent,
		DialogComponent,
		OptionDirective
	],
	imports: [
		CommonModule,
		MatDialogModule,
		MatTableModule,
		FlexLayoutModule,
		FormsModule,
		ReactiveFormsModule,
		SingleInputDialogModule,
		LoadingModule,
	],
	exports: [
		OptionDialogComponent,
		OptionDirective
	]
})
export class OptionDialogModule { }
