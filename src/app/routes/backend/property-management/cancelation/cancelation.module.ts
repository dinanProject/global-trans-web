import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CancelationRoutingModule } from './cancelation-routing.module';
import { CancelationComponent } from './cancelation.component';
import { UiModule } from 'src/app/modules/ui.module';
import { DirectiveModule } from 'src/app/directives/directive.module';
import { DetailComponent } from './detail/detail.component';
import { FormsModule } from '@angular/forms';
import { NgxCurrencyModule } from 'ngx-currency';


@NgModule({
	declarations: [CancelationComponent, DetailComponent],
	imports: [
		CommonModule,
		CancelationRoutingModule,
		UiModule,
		DirectiveModule,
		FormsModule,
		NgxCurrencyModule
	]
})
export class CancelationModule { }
