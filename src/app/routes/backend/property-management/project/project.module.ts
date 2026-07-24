import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProjectRoutingModule } from './project-routing.module';
import { ProjectComponent } from './project.component';
import { UiModule } from 'src/app/modules/ui.module';
import { DirectiveModule } from 'src/app/directives/directive.module';
import { DetailComponent } from './detail/detail.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PaymentPlanComponent } from './detail/payment-plan/payment-plan.component';
import { UnitComponent } from './detail/unit/unit.component';
import { PriceComponent } from './detail/unit/price/price.component';
import { NgxCurrencyModule } from 'ngx-currency';
import { PaymentPlanDetailComponent } from './detail/payment-plan/payment-plan-detail/payment-plan-detail.component';
import { PropertyAgentComponent } from './detail/property-agent/property-agent.component';
import { LeadPropertyAgentComponent } from './detail/lead-property-agent/lead-property-agent.component';


@NgModule({
	declarations: [
		ProjectComponent,
		DetailComponent,
		PaymentPlanComponent,
		UnitComponent,
		PriceComponent,
		PaymentPlanDetailComponent,
		PropertyAgentComponent,
		LeadPropertyAgentComponent],
	imports: [
		CommonModule,
		ProjectRoutingModule,
		UiModule,
		DirectiveModule,
		FormsModule,
		ReactiveFormsModule,
		NgxCurrencyModule,
	]
})
export class ProjectModule { }
