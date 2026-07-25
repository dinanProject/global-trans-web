import { Component, OnInit, Input } from '@angular/core';
import { environment as env } from 'src/environments/environment';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'loading',
	templateUrl: './loading.component.html',
	styleUrls: ['./loading.component.scss']
})
export class LoadingComponent implements OnInit {

	apiUrl = env.apiUrl;
	@Input() text = 'Please wait..';
	@Input() textColor = '#354052';
	@Input() size = '40px';
	@Input() left = '50%';
	@Input() top = '50%';
	isProduction = env.production;

	constructor() { }

	ngOnInit() {
	}

}
