import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReservationComponent } from './reservation.component';

const routes: Routes = [
	{
		path: '',
		component: ReservationComponent
	},
	{
		path: ':reservationId',
		loadChildren: () => import('./detail/detail.module').then(m => m.DetailModule)
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class ReservationRoutingModule { }
