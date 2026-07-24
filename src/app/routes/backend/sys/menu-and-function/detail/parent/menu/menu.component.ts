import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
	selector: 'app-parent-menu',
	templateUrl: './menu.component.html',
	styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {

	@Input() menus: Array<any> = [];
	@Input() selectedMenuId: number;
	@Output() selectClick: EventEmitter<any> = new EventEmitter();

	constructor() { }

	ngOnInit(): void {
		console.log('selectedMenuId', this.selectedMenuId);
	}

	select(menu) {
		this.selectClick.emit(menu);
	}
}
