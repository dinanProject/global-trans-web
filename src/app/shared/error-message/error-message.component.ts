import { Component, OnInit } from '@angular/core';

@Component({
	selector: 'error-message',
	styleUrls: ['./error-message.component.scss'],
	template: `<p><ng-content ></ng-content></p>`
})
export class ErrorMessageComponent implements OnInit {

	constructor() { }

	ngOnInit(): void {
	}

}
