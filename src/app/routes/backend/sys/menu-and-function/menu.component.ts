import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
	selector: 'app-menu',
	templateUrl: './menu.component.html',
	styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {

	@Input() menus: Array<any> = [];
	@Output() addMenuClick: EventEmitter<any> = new EventEmitter();
	@Output() editMenuClick: EventEmitter<any> = new EventEmitter();
	@Output() deleteMenuClick: EventEmitter<any> = new EventEmitter();
	constructor() { }

	ngOnInit(): void {
	}

	addMenu(menuId) {
		this.addMenuClick.emit(menuId);
	}

	editMenu(menuId) {
		this.editMenuClick.emit(menuId);
	}

	deleteMenu(menuId) {
		this.deleteMenuClick.emit(menuId);
	}

}
