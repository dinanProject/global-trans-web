import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DetailRoutingModule } from './detail-routing.module';
import { DetailComponent } from './detail.component';
import { UiModule } from 'src/app/modules/ui.module';
import { DirectiveModule } from 'src/app/directives/directive.module';
import { NgxCurrencyModule } from 'ngx-currency';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CustomPlanComponent } from './custom-plan/custom-plan.component';
import { ChangeUnitComponent } from './change-unit/change-unit.component';


@NgModule({
	declarations: [
		CustomPlanComponent,
		DetailComponent,
  ChangeUnitComponent
	],
	imports: [
		CommonModule,
		DetailRoutingModule,
		UiModule,
		DirectiveModule,
		NgxCurrencyModule,
		FormsModule,
		ReactiveFormsModule
	]
})
export class DetailModule { }
