import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MenuManagementRoutingModule } from './menu-management-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UiModule } from 'src/app/shared/ui.module';
import { MenuDialogComponent } from './menu-dialog/menu-dialog.component';
import { MenuManagementComponent } from './menu-management.component';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
	declarations: [MenuManagementComponent, MenuDialogComponent],
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,

		MenuManagementRoutingModule,

		UiModule,

		MatDialogModule,
		MatMenuModule,
		MatTableModule,
		MatSlideToggleModule,
		MatButtonModule,
		MatIconModule,
	],
})
export class MenuManagementModule {}
