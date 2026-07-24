import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
	{
		path: 'area',
		loadChildren: () => import('./area/area.module').then(m => m.AreaModule)
	},
	{
		path: 'company',
		loadChildren: () => import('./company/company.module').then(m => m.CompanyModule)
	},
	{
		path: 'lookup',
		loadChildren: () => import('./lookup/lookup.module').then(m => m.LookupModule)
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class CommonRoutingModule { }
