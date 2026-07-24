import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SalesRoutingModule } from './sales-routing.module';
import { SalesComponent } from './sales.component';
import { UiModule } from 'src/app/modules/ui.module';
import { DetailComponent } from './detail/detail.component';
import { DirectiveModule } from 'src/app/directives/directive.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxCurrencyModule } from 'ngx-currency';
import { ReasonComponent } from './detail/reason/reason.component';
import { AkadComponent } from './detail/akad/akad.component';
import { HandoverComponent } from './detail/handover/handover.component';
import { RevisionComponent } from './detail/revision/revision.component';


@NgModule({
	declarations: [
		SalesComponent,
		DetailComponent,
		ReasonComponent,
		AkadComponent,
		HandoverComponent,
  RevisionComponent
	],
	imports: [
		CommonModule,
		SalesRoutingModule,
		UiModule,
		DirectiveModule,
		ReactiveFormsModule,
		FormsModule,
		NgxCurrencyModule
	]
})
export class SalesModule { }
