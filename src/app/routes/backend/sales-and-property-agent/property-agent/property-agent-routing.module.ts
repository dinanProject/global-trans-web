import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DetailComponent } from './detail/detail.component';
import { PropertyAgentComponent } from './property-agent.component';

const routes: Routes = [
	{
		path: '',
		component: PropertyAgentComponent
	},
	{
		path: ':propertyAgentId',
		component: DetailComponent
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class PropertyAgentRoutingModule { }
