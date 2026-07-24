import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DebtorsAccountRoutingModule } from './debtors-account-routing.module';
import { DebtorsAccountComponent } from './debtors-account.component';
import { UiModule } from 'src/app/modules/ui.module';
import { DetailComponent } from './detail/detail.component';


@NgModule({
	declarations: [DebtorsAccountComponent, DetailComponent],
	imports: [
		CommonModule,
		DebtorsAccountRoutingModule,
		UiModule
	]
})
export class DebtorsAccountModule { }
