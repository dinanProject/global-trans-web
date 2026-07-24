import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClientComponent } from './client.component';
import { DetailComponent } from './detail/detail.component';

const routes: Routes = [
	{
		path: '',
		component: ClientComponent
	},
	{
		path: ':clientId',
		component: DetailComponent
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class ClientRoutingModule { }
