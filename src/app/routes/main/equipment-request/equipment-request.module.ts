import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { EquipmentRequestRoutingModule } from './equipment-request-routing.module';
import { EquipmentRequestComponent } from './equipment-request.component';
import { EquipmentRequestFormDialogComponent } from './equipment-request-form-dialog/equipment-request-form-dialog.component';
import { EquipmentRequestDetailDialogComponent } from './equipment-request-detail-dialog/equipment-request-detail-dialog.component';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { PageModule } from 'src/app/shared/page/page.module';
import { PanelModule } from 'src/app/shared/panel/panel.module';
import { LoadingModule } from 'src/app/shared/loading/loading.module';

@NgModule({
	declarations: [
		EquipmentRequestComponent,
		EquipmentRequestFormDialogComponent,
		EquipmentRequestDetailDialogComponent,
	],
	imports: [
		CommonModule,
		ReactiveFormsModule,
		EquipmentRequestRoutingModule,

		PageModule,
		PanelModule,
		LoadingModule,

		MatTableModule,
		MatMenuModule,
		MatDialogModule,
		MatTabsModule,
	],
})
export class EquipmentRequestModule {}
