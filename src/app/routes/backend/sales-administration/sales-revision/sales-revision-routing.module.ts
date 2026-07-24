import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DetailComponent } from './detail/detail.component';
import { SalesRevisionComponent } from './sales-revision.component';

const routes: Routes = [
	{
		path: '',
		component: SalesRevisionComponent
	},
	{
		path: ':salesRevisionId',
		component: DetailComponent
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class SalesRevisionRoutingModule { }
