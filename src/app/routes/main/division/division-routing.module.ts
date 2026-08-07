import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DivisionComponent } from './division.component';
import { PermissionGuard } from 'src/app/core/guards/permission-guard';

const routes: Routes = [
	{
		path: '',
		component: DivisionComponent,
		canActivate: [PermissionGuard],
		data: {
			permission: 'DIVISION.VIEW',
		},
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class DivisionRoutingModule {}
