import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DetailComponent } from './detail/detail.component';
import { SalesTransactionComponent } from './sales-transaction.component';

const routes: Routes = [
	{
		path: '',
		component: SalesTransactionComponent
	},
	{
		path: ':salesId',
		component: DetailComponent
	},
	{
		path: ':salesId/revision',
		component: DetailComponent
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class SalesTransactionRoutingModule { }
