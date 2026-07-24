import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
	{
		path: 'billing',
		loadChildren: () => import('./billing/billing.module').then(m => m.BillingModule)
	},
	{
		path: 'payment',
		loadChildren: () => import('./payment/payment.module').then(m => m.PaymentModule)
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class FinanceRoutingModule { }
