import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DebtorsAccountComponent } from './debtors-account.component';
import { DetailComponent } from './detail/detail.component';

const routes: Routes = [
	{
		path: '',
		component: DebtorsAccountComponent
	},
	{
		path: ':salesId',
		component: DetailComponent
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class DebtorsAccountRoutingModule { }
