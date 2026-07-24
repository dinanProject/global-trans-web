import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CashReceiptComponent } from './cash-receipt.component';

const routes: Routes = [
	{
		path: '',
		component: CashReceiptComponent
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class CashReceiptRoutingModule { }
