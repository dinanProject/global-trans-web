import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { UiModule } from 'src/app/modules/ui.module';
import { ChartsModule } from 'ng2-charts';


@NgModule({
	declarations: [DashboardComponent],
	imports: [
		CommonModule,
		DashboardRoutingModule,
		UiModule,
		ChartsModule
	]
})
export class DashboardModule { }
