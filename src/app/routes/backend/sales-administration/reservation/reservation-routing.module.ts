import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DetailComponent } from './detail/detail.component';
import { ReservationComponent } from './reservation.component';

const routes: Routes = [
	{
		path: '',
		component: ReservationComponent
	},
	{
		path: ':reservationId',
		component: DetailComponent
	},
	{
		path: 'new/:unitId',
		component: DetailComponent
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class ReservationRoutingModule { }
