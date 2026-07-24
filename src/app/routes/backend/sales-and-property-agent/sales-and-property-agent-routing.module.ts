import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
	{
		path: 'property-agent',
		loadChildren: () => import(`./property-agent/property-agent.module`).then(m => m.PropertyAgentModule),
		data: {
			subtitle: 'Property Agent'
		}
	},
	{
		path: 'sales-agent',
		loadChildren: () => import(`./sales-agent/sales-agent.module`).then(m => m.SalesAgentModule),
		data: {
			subtitle: 'Sales Agent'
		}
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class SalesAndPropertyAgentRoutingModule { }
