import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DetailComponent } from './detail/detail.component';
import { UnitComponent } from './detail/unit/unit.component';
import { ProjectComponent } from './project.component';

const routes: Routes = [
	{
		path: '',
		component: ProjectComponent
	},
	{
		path: ':projectId',
		component: DetailComponent
	},
	{
		path: ':projectId/siteplan',
		loadChildren: () => import('./siteplan/siteplan.module').then(m => m.SiteplanModule)
	},
	{
		path: ':projectId/siteplan-mapper',
		loadChildren: () => import('./siteplan-mapper/siteplan-mapper.module').then(m => m.SiteplanMapperModule)
	},
	{
		path: ':projectId/unit/:unitId',
		component: UnitComponent
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class ProjectRoutingModule { }
