import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReservationRoutingModule } from './reservation-routing.module';
import { ReservationComponent } from './reservation.component';
import { UiModule } from 'src/app/modules/ui.module';
import { DetailComponent } from './detail/detail.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UnitComponent } from './unit/unit.component';
import { NgxCurrencyModule } from 'ngx-currency';
import { PaymentPlanComponent } from './detail/payment-plan/payment-plan.component';
import { SalesInhouseComponent } from './detail/sales-inhouse/sales-inhouse.component';
import { SalesAgentComponent } from './detail/sales-agent/sales-agent.component';
import { DirectiveModule } from 'src/app/directives/directive.module';


@NgModule({
	declarations: [
		ReservationComponent,
		DetailComponent,
		UnitComponent,
		PaymentPlanComponent,
		SalesInhouseComponent,
		SalesAgentComponent
	],
	imports: [
		CommonModule,
		ReservationRoutingModule,
		UiModule,
		FormsModule,
		ReactiveFormsModule,
		NgxCurrencyModule,
		DirectiveModule
	]
})
export class ReservationModule { }
