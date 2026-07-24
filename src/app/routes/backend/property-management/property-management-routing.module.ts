import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
	{
		path: 'cancelation',
		loadChildren: () => import('./cancelation/cancelation.module').then(m => m.CancelationModule),
		data: {
			subtitle: 'Canceled Units'
		}
	},
	{
		path: 'customer',
		loadChildren: () => import('./customer/customer.module').then(m => m.CustomerModule),
		data: {
			subtitle: 'Customers'
		}
	},
	{
		path: 'dashboard',
		loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule),
		data: {
			subtitle: 'Dashboard'
		}
	},
	{
		path: 'project',
		loadChildren: () => import('./project/project.module').then(m => m.ProjectModule),
		data: {
			subtitle: 'Project'
		}
	},
	{
		path: 'report',
		loadChildren: () => import('./report/report.module').then(m => m.ReportModule),
		data: {
			subtitle: 'Report'
		}
	},
	{
		path: 'reservation',
		loadChildren: () => import('./reservation/reservation.module').then(m => m.ReservationModule),
		data: {
			subtitle: 'Reservation'
		}
	},
	{
		path: 'sales',
		loadChildren: () => import('./sales/sales.module').then(m => m.SalesModule),
		data: {
			subtitle: 'Sales'
		}
	},
	{
		path: 'unit',
		loadChildren: () => import('./unit/unit.module').then(m => m.UnitModule),
		data: {
			subtitle: 'Unit'
		}
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class PropertyManagementRoutingModule { }
