import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
	BaseChartDirective,
	provideCharts,
	withDefaultRegisterables,
} from 'ng2-charts';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { PageModule } from 'src/app/shared/page/page.module';
import { PanelModule } from 'src/app/shared/panel/panel.module';
import { LoadingModule } from 'src/app/shared/loading/loading.module';

@NgModule({
	declarations: [HomeComponent],
	imports: [
		CommonModule,
		FormsModule,
		BaseChartDirective,
		PageModule,
		PanelModule,
		LoadingModule,
		HomeRoutingModule,
	],
	providers: [provideCharts(withDefaultRegisterables())],
})
export class HomeModule {}
