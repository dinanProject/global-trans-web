import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
	{
		path: 'reservation',
		loadChildren: () => import('./reservation/reservation.module').then(m => m.ReservationModule),
		data: {
			subtitle: 'Reservation'
		}
	},
	{
		path: 'sales-transaction',
		loadChildren: () => import('./sales-transaction/sales-transaction.module').then(m => m.SalesTransactionModule),
		data: {
			subtitle: 'Sales Transaction'
		}
	},
	{
		path: 'sales-revision',
		loadChildren: () => import('./sales-revision/sales-revision.module').then(m => m.SalesRevisionModule),
		data: {
			subtitle: 'Sales Revision'
		}
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class SalesAdministrationRoutingModule { }
