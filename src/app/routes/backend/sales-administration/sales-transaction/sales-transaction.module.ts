import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SalesTransactionRoutingModule } from './sales-transaction-routing.module';
import { SalesTransactionComponent } from './sales-transaction.component';
import { UiModule } from 'src/app/modules/ui.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DetailComponent } from './detail/detail.component';
import { DirectiveModule } from 'src/app/directives/directive.module';
import { CancelationComponent } from './detail/cancelation/cancelation.component';
import { NgxCurrencyModule } from 'ngx-currency';


@NgModule({
	declarations: [
		SalesTransactionComponent,
		DetailComponent,
		CancelationComponent
	],
	imports: [
		CommonModule,
		SalesTransactionRoutingModule,
		UiModule,
		FormsModule,
		NgxCurrencyModule,
		DirectiveModule,
		ReactiveFormsModule
	]
})
export class SalesTransactionModule { }
