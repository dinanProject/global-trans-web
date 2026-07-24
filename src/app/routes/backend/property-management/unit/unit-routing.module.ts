import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DetailComponent } from './detail/detail.component';
import { UnitComponent } from './unit.component';

const routes: Routes = [
	{
		path: '',
		component: UnitComponent
	},
	{
		path: ':unitId',
		component: DetailComponent
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class UnitRoutingModule { }
