import { Component, EventEmitter, HostBinding, HostListener, Input, OnInit, Output } from '@angular/core';

@Component({
	selector: 'loading-button',
	templateUrl: './loading-button.component.html',
	styleUrls: ['./loading-button.component.scss']
})
export class LoadingButtonComponent implements OnInit {

	@Input() isLoading: boolean;
	@Input() disabled: boolean;
	@Input() loadingText = 'Loading..';
	@Input() type: string = 'button';
	@Input() className: string = 'btn btn-primary';

	constructor() { }

	ngOnInit(): void {
	}
}
