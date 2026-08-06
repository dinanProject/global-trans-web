import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MenuManagementComponent } from './menu-management.component';
import { PermissionGuard } from 'src/app/core/guards/permission-guard';

const routes: Routes = [
	{
		path: '',
		component: MenuManagementComponent,
		canActivate: [PermissionGuard],
		data: {
			title: 'Administration',
			subtitle: '',
			permission: 'MENU.VIEW',
		},
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class MenuManagementRoutingModule {}
