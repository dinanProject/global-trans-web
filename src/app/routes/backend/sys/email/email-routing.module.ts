import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DetailComponent } from './detail/detail.component';
import { EmailComponent } from './email.component';

const routes: Routes = [
	{
		path: '',
		component: EmailComponent
	},
	{
		path: ':emailId',
		component: DetailComponent
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class EmailRoutingModule { }
