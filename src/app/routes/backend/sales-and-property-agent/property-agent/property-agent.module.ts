import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PropertyAgentRoutingModule } from './property-agent-routing.module';
import { PropertyAgentComponent } from './property-agent.component';
import { DetailComponent } from './detail/detail.component';
import { UiModule } from 'src/app/modules/ui.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SalesAgentComponent } from './detail/sales-agent/sales-agent.component';

@NgModule({
	declarations: [
		PropertyAgentComponent,
		DetailComponent,
		SalesAgentComponent
	],
	imports: [
		CommonModule,
		PropertyAgentRoutingModule,
		UiModule,
		FormsModule,
		ReactiveFormsModule
	]
})
export class PropertyAgentModule { }
