import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PermissionComponent } from './permission-management/permission.component';
import { RoleComponent } from './role-management/role.component';
import { UserComponent } from './user/user.component';
import { LoginLogComponent } from './login-log/login-log.component';

const routes: Routes = [
	{
		path: 'login-log',
		component: LoginLogComponent,
		data: {
			title: 'Administration',
		},
	},
	{
		path: 'role-management',
		component: RoleComponent,
		data: {
			title: 'Administration',
			subtitle: '',
		},
	},
	{
		path: 'permission-management',
		component: PermissionComponent,
		data: {
			title: 'Administration',
			subtitle: '',
		},
	},
	{
		path: 'users',
		component: UserComponent,
		data: {
			title: 'Administration',
			subtitle: '',
		},
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class AdministrationRoutingModule {}
