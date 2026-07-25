import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OptionDialogComponent, OptionDirective, } from './option-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
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
