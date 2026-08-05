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
import { UserPasswordDialogComponent } from './user/user-password-dialog/user-password-dialog.component';
import { LoginLogComponent } from './login-log/login-log.component';
import { MatPaginatorModule } from '@angular/material/paginator';

@NgModule({
	declarations: [
		RoleComponent,
		PermissionComponent,

		RoleFormDialogComponent,
		RolePermissionDialogComponent,
		PermissionFormDialogComponent,
		UserComponent,
		UserFormDialogComponent,
		UserPasswordDialogComponent,
		LoginLogComponent,
	],
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		FlexLayoutModule,

		PageModule,
		PanelModule,
		LoadingModule,

		MatDialogModule,
		MatProgressSpinnerModule,
		MatTabsModule,
		MatMenuModule,
		MatTableModule,
		MatPaginatorModule,

		AdministrationRoutingModule,
	],
})
export class AdministrationModule {}
