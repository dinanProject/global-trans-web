import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CompanyComponent } from './company.component';
import { PermissionGuard } from 'src/app/core/guards/permission-guard';

const routes: Routes = [
	{
		path: '',
		component: CompanyComponent,
		canActivate: [PermissionGuard],
		data: {
			permission: 'COMPANY.VIEW',
		},
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class CompanyRoutingModule {}
