import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
	{
		path: 'cash-receipt',
		loadChildren: () => import('./cash-receipt/cash-receipt.module').then(m => m.CashReceiptModule),
		data: {
			subtitle: 'Cash Receipt'
		}
	},
	{
		path: 'debtors-account',
		loadChildren: () => import('./debtors-account/debtors-account.module').then(m => m.DebtorsAccountModule),
		data: {
			subtitle: 'Debtors Account'
		}
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class ArRoutingModule { }
