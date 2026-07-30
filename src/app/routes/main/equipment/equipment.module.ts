import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';

import { EquipmentRoutingModule } from './equipment-routing.module';

import { CategoryComponent } from './category/category.component';
import { CategoryDialogComponent } from './category/category-dialog/category-dialog.component';

import { UnitComponent } from './unit/unit.component';
import { UnitDialogComponent } from './unit/unit-dialog/unit-dialog.component';
import { PageModule } from 'src/app/shared/page/page.module';
import { PanelModule } from 'src/app/shared/panel/panel.module';
import { LoadingModule } from 'src/app/shared/loading/loading.module';

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

		MatDialogModule,
		MatMenuModule,
		MatTableModule,

		PageModule,
		PanelModule,
		LoadingModule,

		EquipmentRoutingModule,
	],
})
export class EquipmentModule {}
