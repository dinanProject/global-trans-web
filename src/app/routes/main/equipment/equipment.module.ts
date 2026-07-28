import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';

import { UiModule } from '../../../shared/ui.module';

import { EquipmentRoutingModule } from './equipment-routing.module';

import { CategoryComponent } from './category/category.component';
import { CategoryDialogComponent } from './category/category-dialog/category-dialog.component';

import { UnitComponent } from './unit/unit.component';
import { UnitDialogComponent } from './unit/unit-dialog/unit-dialog.component';

@NgModule({
	declarations: [
		CategoryComponent,
		CategoryDialogComponent,
		UnitComponent,
		UnitDialogComponent,
	],
	imports: [
		CommonModule,
		ReactiveFormsModule,
		UiModule,

		MatDialogModule,
		MatMenuModule,
		MatSlideToggleModule,
		MatSortModule,
		MatTableModule,

		EquipmentRoutingModule,
	],
})
export class EquipmentModule {}
