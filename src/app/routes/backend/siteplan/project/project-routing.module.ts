import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProjectComponent } from './project.component';

const routes: Routes = [
	{
		path: '',
		component: ProjectComponent,
		data: {
			subtitle: 'Project'
		}
	},
	{
		path: ':projectId/unit',
		loadChildren: () => import('./unit/unit.module').then(m => m.UnitModule),
		data: {
			subtitle: 'Unit'
		}
	},
	{
		path: ':projectId/map',
		loadChildren: () => import('./map/map.module').then(m => m.MapModule)
	},
	{
		path: ':projectId/mapper',
		loadChildren: () => import('./mapper/mapper.module').then(m => m.MapperModule),
		data: {
			subtitle: 'Mapper'
		}
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class ProjectRoutingModule { }
