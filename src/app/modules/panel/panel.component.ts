import { Component, OnInit, Input, HostBinding } from '@angular/core';

@Component({
	selector: 'panel',
	template: `
		<ng-content></ng-content>
	`,
	styleUrls: ['./panel.component.scss'],
})
export class PanelComponent implements OnInit {
	@HostBinding('class.panel') panelHeader = true;
	constructor() { }
	ngOnInit(): void { }
}

@Component({
	selector: 'panel-header',
	// template: '<h1 class="panel-title">{{ title }}</h1>'
	template: '<ng-content></ng-content>'
})
export class PanelHeaderComponent implements OnInit {

	@HostBinding('class.panel-header') panelHeader = true;
	@Input() title: string;
	constructor() { }

	ngOnInit(): void {
	}

}

@Component({
	selector: 'panel-filter',
	template: '<ng-content></ng-content>'
})
export class PanelFilterComponent implements OnInit {
	@HostBinding('class.panel-filter') panelHeader = true;
	constructor() { }
	ngOnInit(): void { }
}

@Component({
	selector: 'panel-body',
	template: '<ng-content></ng-content>'
})
export class PanelBodyComponent implements OnInit {
	@HostBinding('class.panel-body') panelHeader = true;
	constructor() { }

	ngOnInit(): void {
	}

}

@Component({
	selector: 'panel-footer',
	template: '<ng-content></ng-content>'
})
export class PanelFooterComponent implements OnInit {
	@HostBinding('class.panel-footer') panelHeader = true;
	constructor() { }

	ngOnInit(): void {
	}

}
