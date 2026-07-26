import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { UiModule } from 'src/app/shared/ui.module';

import { DivisionDialogComponent } from './division-dialog/division-dialog.component';
import { DivisionRoutingModule } from './division-routing.module';
import { DivisionService } from './division.service';
import { DivisionComponent } from './division.component';

@NgModule({
	declarations: [DivisionComponent, DivisionDialogComponent],
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		UiModule,
		DivisionRoutingModule,
	],
	providers: [DivisionService],
})
export class DivisionModule {}
