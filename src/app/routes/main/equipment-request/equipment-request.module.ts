import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';

import { UiModule } from 'src/app/shared/ui.module';
import { EquipmentRequestRoutingModule } from './equipment-request-routing.module';
import { EquipmentRequestComponent } from './equipment-request.component';
import { EquipmentRequestFormDialogComponent } from './equipment-request-form-dialog/equipment-request-form-dialog.component';
import { EquipmentRequestDetailDialogComponent } from './equipment-request-detail-dialog/equipment-request-detail-dialog.component';

@NgModule({
	declarations: [
		EquipmentRequestComponent,
		EquipmentRequestFormDialogComponent,
		EquipmentRequestDetailDialogComponent,
	],
	imports: [
		CommonModule,
		ReactiveFormsModule,
		FlexLayoutModule,
		EquipmentRequestRoutingModule,
		UiModule,
		MatDialogModule,
		MatTabsModule,
	],
})
export class EquipmentRequestModule {}
