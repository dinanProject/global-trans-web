import { Component, HostBinding, OnInit } from '@angular/core';

@Component({
    selector: 'page-header',
    template: '<ng-content></ng-content>',
    styleUrls: ['./page-header.component.scss'],
    standalone: false
})
export class PageHeaderComponent implements OnInit {

	@HostBinding('class.container-fluid') containerFluid = true;

	constructor() { }

	ngOnInit(): void {
	}

}
@Component({
    selector: 'page-body',
    template: '<ng-content></ng-content>',
    styleUrls: ['./page-body.component.scss'],
    standalone: false
})
export class PageBodyComponent implements OnInit {

	@HostBinding('class.container-fluid') containerFluid = true;

	constructor() { }

	ngOnInit(): void {
	}

}
