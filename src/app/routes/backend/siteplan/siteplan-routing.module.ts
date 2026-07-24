import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
	{
		path: 'project',
		loadChildren: () => import('./project/project.module').then(m => m.ProjectModule),
		data: {
			subtitle: 'Project'
		}
	},
	{
		path: 'sales',
		loadChildren: () => import('./sales/sales.module').then(m => m.SalesModule),
		data: {
			subtitle: 'Sales'
		}
	},
	{
		path: 'unit',
		loadChildren: () => import('./unit/unit.module').then(m => m.UnitModule),
		data: {
			subtitle: 'Unit'
		}
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class SiteplanRoutingModule { }
