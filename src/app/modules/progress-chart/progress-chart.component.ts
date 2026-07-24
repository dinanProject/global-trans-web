import { Component, OnInit, Input } from '@angular/core';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'progress-chart',
	templateUrl: './progress-chart.component.html',
	styleUrls: ['./progress-chart.component.scss']
})
export class ProgressChartComponent implements OnInit {

	@Input() value: number;
	@Input() max: number;
	@Input() valueColor = '#000000';
	@Input() maxColor = '#DFE7EC';
	@Input() height = 3;
	@Input() width = 0;

	constructor() { }

	ngOnInit() {
		// console.log('valuePercent', this.value, this.max, this.valuePercent);
	}

	getValuePercent() {
		return this.value / this.max * 100;
	}

}
