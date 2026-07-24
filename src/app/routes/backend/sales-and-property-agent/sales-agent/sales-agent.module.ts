import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SalesAgentRoutingModule } from './sales-agent-routing.module';
import { SalesAgentComponent } from './sales-agent.component';
import { DetailComponent } from './detail/detail.component';
import { UiModule } from 'src/app/modules/ui.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
	declarations: [
		SalesAgentComponent,
		DetailComponent
	],
	imports: [
		CommonModule,
		SalesAgentRoutingModule,
		UiModule,
		FormsModule,
		ReactiveFormsModule
	]
})
export class SalesAgentModule { }
