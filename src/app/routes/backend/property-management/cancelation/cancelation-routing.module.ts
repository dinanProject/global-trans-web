import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CancelationComponent } from './cancelation.component';
import { DetailComponent } from './detail/detail.component';

const routes: Routes = [
	{
		path: '',
		component: CancelationComponent
	},
	{
		path: ':salesCancelationId',
		component: DetailComponent
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class CancelationRoutingModule { }
