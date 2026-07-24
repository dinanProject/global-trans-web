import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DetailComponent } from './detail/detail.component';
import { LeadComponent } from './lead.component';

const routes: Routes = [
	{
		path: '',
		component: LeadComponent,
		data: {
			subtitle: 'Leads'
		}
	},
	{
		path: ':leadId',
		component: DetailComponent,
		data: {
			subtitle: 'Lead Detail'
		}
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class LeadRoutingModule { }
