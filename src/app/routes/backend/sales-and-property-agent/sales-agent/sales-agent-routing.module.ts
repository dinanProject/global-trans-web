import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SalesAgentComponent } from './sales-agent.component';

const routes: Routes = [
	{
		path: '',
		component: SalesAgentComponent
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class SalesAgentRoutingModule { }
