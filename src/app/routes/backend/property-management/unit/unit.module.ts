import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UnitRoutingModule } from './unit-routing.module';
import { UnitComponent } from './unit.component';
import { UiModule } from 'src/app/modules/ui.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DetailComponent } from './detail/detail.component';
import { NgxCurrencyModule } from 'ngx-currency';
import { PriceComponent } from './detail/price/price.component';


@NgModule({
	declarations: [UnitComponent, DetailComponent, PriceComponent],
	imports: [
		CommonModule,
		UnitRoutingModule,
		UiModule,
		FormsModule,
		ReactiveFormsModule,
		NgxCurrencyModule,
	]
})
export class UnitModule { }
