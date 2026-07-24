import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SiteplanComponent } from './siteplan.component';

const routes: Routes = [
	{
		path: '',
		component: SiteplanComponent
	},
	{
		path: ':unitId',
		loadChildren: () => import('./unit/unit.module').then(m => m.UnitModule)
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class SiteplanRoutingModule { }
