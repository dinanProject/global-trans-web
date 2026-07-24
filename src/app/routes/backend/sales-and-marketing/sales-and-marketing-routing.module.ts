import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
	{
		path: 'lead',
		loadChildren: () => import('./lead/lead.module').then(m => m.LeadModule),
		data: {
			subtitle: 'Leads'
		}
	},
	{
		path: 'sales',
		loadChildren: () => import('./sales/sales.module').then(m => m.SalesModule),
		data: {
			subtitle: 'Sales Executives'
		}
	},
	{
		path: 'sales-registration',
		loadChildren: () => import('./sales-registration/sales-registration.module').then(m => m.SalesRegistrationModule),
		data: {
			subtitle: 'Sales Registration'
		}
	},
	{
		path: 'team',
		loadChildren: () => import('./team/team.module').then(m => m.TeamModule),
		data: {
			subtitle: 'Teams'
		}
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class SalesAndMarketingRoutingModule { }
