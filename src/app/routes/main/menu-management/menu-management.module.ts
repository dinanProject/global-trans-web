import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { UiModule } from 'src/app/shared/ui.module';

import { MenuDialogComponent } from './menu-dialog/menu-dialog.component';
import { MenuManagementRoutingModule } from './menu-management-routing.module';
import { MenuManagementService } from './menu-management.service';
import { MenuManagementComponent } from './menu-management.component';

@NgModule({
	declarations: [MenuManagementComponent, MenuDialogComponent],
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		UiModule,
		MenuManagementRoutingModule,
	],
	providers: [MenuManagementService],
})
export class MenuManagementModule {}
