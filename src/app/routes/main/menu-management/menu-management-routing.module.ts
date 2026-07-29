import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MenuManagementComponent } from './menu-management.component';

const routes: Routes = [
	{
		path: '',
		component: MenuManagementComponent,
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
export class MenuManagementRoutingModule {}
