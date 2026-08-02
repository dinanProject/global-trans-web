import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';

import { AdministrationRoutingModule } from './administration-routing.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RoleComponent } from './role-management/role.component';
import { PermissionComponent } from './permission-management/permission.component';
import { RoleFormDialogComponent } from './role-management/role-form-dialog/role-form-dialog.component';
import { PermissionFormDialogComponent } from './permission-management/permission-form-dialog/permission-form-dialog.component';
import { UserComponent } from './user/user.component';
import { UserFormDialogComponent } from './user/user-form-dialog/user-form-dialog.component';
import { PageModule } from 'src/app/shared/page/page.module';
import { PanelModule } from 'src/app/shared/panel/panel.module';
import { LoadingModule } from 'src/app/shared/loading/loading.module';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { RolePermissionDialogComponent } from './role-management/role-permission-dialog/role-permission-dialog.component';

@NgModule({
	declarations: [
		RoleComponent,
		PermissionComponent,

		RoleFormDialogComponent,
		RolePermissionDialogComponent,
		PermissionFormDialogComponent,
		UserComponent,
		UserFormDialogComponent,
	],
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		FlexLayoutModule,

		PageModule,
		PanelModule,
		LoadingModule,
		PageModule,
		PanelModule,
		LoadingModule,

		MatDialogModule,
		MatProgressSpinnerModule,
		MatTabsModule,
		MatMenuModule,
		MatTableModule,

		AdministrationRoutingModule,
	],
})
export class AdministrationModule {}
