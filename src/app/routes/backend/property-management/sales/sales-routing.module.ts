import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DetailComponent } from './detail/detail.component';
import { SalesComponent } from './sales.component';

const routes: Routes = [
	{
		path: '',
		component: SalesComponent
	},
	{
		path: ':salesId',
		component: DetailComponent
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class SalesRoutingModule { }
