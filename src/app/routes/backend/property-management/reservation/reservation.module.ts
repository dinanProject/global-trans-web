import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReservationRoutingModule } from './reservation-routing.module';
import { ReservationComponent } from './reservation.component';
import { UiModule } from 'src/app/modules/ui.module';
import { DirectiveModule } from 'src/app/directives/directive.module';
import { NewComponent } from './new/new.component';


@NgModule({
	declarations: [ReservationComponent, NewComponent],
	imports: [
		CommonModule,
		ReservationRoutingModule,
		UiModule,
		DirectiveModule
	]
})
export class ReservationModule { }
