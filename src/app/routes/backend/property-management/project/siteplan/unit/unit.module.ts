import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UnitRoutingModule } from './unit-routing.module';
import { UnitComponent } from './unit.component';
import { UiModule } from 'src/app/modules/ui.module';
import { DirectiveModule } from 'src/app/directives/directive.module';
import { ReservationComponent } from './reservation/reservation.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxCurrencyModule } from 'ngx-currency';
import { CustomPlanComponent } from './reservation/custom-plan/custom-plan.component';
import { EditPaymentPlanComponent } from './reservation/edit-payment-plan/edit-payment-plan.component';


@NgModule({
	declarations: [
		UnitComponent,
		ReservationComponent,
		CustomPlanComponent,
		EditPaymentPlanComponent
	],
	imports: [
		CommonModule,
		UnitRoutingModule,
		UiModule,
		DirectiveModule,
		FormsModule,
		ReactiveFormsModule,
		NgxCurrencyModule
	]
})
export class UnitModule { }
