import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MenuManagementRoutingModule } from './menu-management-routing.module';
import { MenuDialogComponent } from './menu-dialog/menu-dialog.component';
import { MenuManagementComponent } from './menu-management.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { PermissionPickerDialogComponent } from './permission-picker-dialog/permission-picker-dialog.component';
import { PageModule } from 'src/app/shared/page/page.module';
import { PanelModule } from 'src/app/shared/panel/panel.module';
import { LoadingModule } from 'src/app/shared/loading/loading.module';
import { MatTableModule } from '@angular/material/table';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
	declarations: [
		MenuManagementComponent,
		MenuDialogComponent,
		PermissionPickerDialogComponent,
	],
	imports: [
		CommonModule,
		ReactiveFormsModule,
		MenuManagementRoutingModule,

		MatTableModule,
		MatMenuModule,
		MatSlideToggleModule,
		MatDialogModule,
		PageModule,
		PanelModule,
		LoadingModule,
	],
})
export class MenuManagementModule {}
