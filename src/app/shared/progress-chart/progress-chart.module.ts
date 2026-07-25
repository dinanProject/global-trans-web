import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressChartComponent } from 'src/app/modules/progress-chart/progress-chart.component';

@NgModule({
	imports: [
		CommonModule
	],
	exports: [
		ProgressChartComponent
	],
	declarations: [
		ProgressChartComponent
	]
})
export class ProgressChartModule { }
