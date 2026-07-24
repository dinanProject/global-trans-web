import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BillingComponent } from './billing.component';
import { DetailComponent } from './detail/detail.component';

const routes: Routes = [
	{
		path: '',
		component: BillingComponent
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
export class BillingRoutingModule { }
