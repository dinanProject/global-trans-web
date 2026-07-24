import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BillingRoutingModule } from './billing-routing.module';
import { BillingComponent } from './billing.component';
import { UiModule } from 'src/app/modules/ui.module';
import { ProcessComponent } from './process/process.component';
import { DirectiveModule } from 'src/app/directives/directive.module';
import { NgxCurrencyModule } from 'ngx-currency';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DetailComponent } from './detail/detail.component';
import { PaymentComponent } from './detail/payment/payment.component';


@NgModule({
	declarations: [
		BillingComponent,
		ProcessComponent,
		DetailComponent,
		PaymentComponent
	],
	imports: [
		CommonModule,
		BillingRoutingModule,
		UiModule,
		DirectiveModule,
		NgxCurrencyModule,
		FormsModule,
		ReactiveFormsModule
	]
})
export class BillingModule { }
