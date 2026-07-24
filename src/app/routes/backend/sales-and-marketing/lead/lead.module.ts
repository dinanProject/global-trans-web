import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LeadRoutingModule } from './lead-routing.module';
import { LeadComponent } from './lead.component';
import { UiModule } from 'src/app/modules/ui.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DetailComponent } from './detail/detail.component';
import { AddComponent } from './add/add.component';
import { SalesComponent } from './sales/sales.component';


@NgModule({
	declarations: [
		LeadComponent,
  DetailComponent,
  AddComponent,
  SalesComponent
	],
	imports: [
		CommonModule,
		LeadRoutingModule,
		UiModule,
		FormsModule,
		ReactiveFormsModule
	]
})
export class LeadModule { }
