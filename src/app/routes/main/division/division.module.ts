import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DivisionDialogComponent } from './division-dialog/division-dialog.component';
import { DivisionRoutingModule } from './division-routing.module';
import { DivisionService } from './division.service';
import { DivisionComponent } from './division.component';
import { PanelModule } from 'src/app/shared/panel/panel.module';
import { PageModule } from 'src/app/shared/page/page.module';
import { LoadingModule } from 'src/app/shared/loading/loading.module';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
	declarations: [DivisionComponent, DivisionDialogComponent],
	imports: [
		CommonModule,
		ReactiveFormsModule,

		MatDialogModule,
		MatMenuModule,
		MatTableModule,

		PageModule,
		PanelModule,
		LoadingModule,
		DivisionRoutingModule,
	],
	providers: [DivisionService],
})
export class DivisionModule {}
