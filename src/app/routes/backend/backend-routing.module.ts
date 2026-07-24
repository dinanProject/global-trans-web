import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BackendComponent } from './backend.component';
import { HomeComponent } from './home.component';
import { NotFoundComponent } from './not-found.component';
import { environment as env } from 'src/environments/environment';

const routes: Routes = [
	{
		path: '',
		component: BackendComponent,
		children: [
			{
				path: '',
				component: HomeComponent,
				data: {
					title: env.appName
				}
			},
			{
				path: 'account',
				loadChildren: () => import('./account/account.module').then(m => m.AccountModule),
				data: {
					title: 'Account'
				}
			},
			{
				path: 'ar',
				loadChildren: () => import('./ar/ar.module').then(m => m.ArModule),
				data: {
					title: 'Account Receivable'
				}
			},
			{
				path: 'common',
				loadChildren: () => import('./common/common.module').then(m => m.CommonModule),
				data: {
					title: 'Common'
				}
			},
			{
				path: 'finance',
				loadChildren: () => import('./finance/finance.module').then(m => m.FinanceModule),
				data: {
					title: 'Finance'
				}
			},
			{
				path: 'hr',
				loadChildren: () => import('./hr/hr.module').then(m => m.HrModule),
				data: {
					title: 'HR'
				}
			},
			{
				path: 'property-management',
				loadChildren: () => import('./property-management/property-management.module').then(m => m.PropertyManagementModule),
				data: {
					title: 'Property Management'
				}
			},
			{
				path: 'sales-administration',
				loadChildren: () => import('./sales-administration/sales-administration.module').then(m => m.SalesAdministrationModule),
				data: {
					title: 'Sales Administration'
				}
			},
			{
				path: 'sales-and-marketing',
				loadChildren: () => import('./sales-and-marketing/sales-and-marketing.module').then(m => m.SalesAndMarketingModule),
				data: {
					title: 'Sales And Marketing'
				}
			},
			{
				path: 'sales-and-property-agent',
				loadChildren: () => import('./sales-and-property-agent/sales-and-property-agent.module').then(m => m.SalesAndPropertyAgentModule),
				data: {
					title: 'Sales And Property Agent'
				}
			},
			{
				path: 'siteplan',
				loadChildren: () => import('./siteplan/siteplan.module').then(m => m.SiteplanModule),
				data: {
					title: 'Siteplan'
				}
			},
			{
				path: 'sys',
				loadChildren: () => import('./sys/sys.module').then(m => m.SysModule),
				data: {
					title: 'System'
				}
			},
			{
				path: '**',
				component: NotFoundComponent
			}
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class BackendRoutingModule { }
