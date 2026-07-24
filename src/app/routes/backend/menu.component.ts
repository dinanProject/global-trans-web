import { Component, EventEmitter, Input, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { environment as env } from 'src/environments/environment';

export interface Menu {
	menuId: number;
	menuName: string;
	route?: string;
	menuTypeId: number;
	parentId: number;
	sequence: number;
	icon?: string;
	child?: Menu[];
	level?: number;
	visibility?: string;
	selected?: boolean;
	// openInId?: number;
	// openInName?: string;
	checked?: boolean;
	index?: number;
}

@Component({
	selector: 'app-menu',
	templateUrl: './menu.component.html',
	styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {

	apiUrl = env.apiUrl;
	// @Input() menus: Array<Menu>;
	@Input() menu: Menu;
	@Input() currentUrl: string;
	@Input() selectedMenuIndex: number;
	@Input() isMenuFiltering: boolean;
	@Output() clicked = new EventEmitter<any>();
	@ViewChildren(MenuComponent) menuComponents: QueryList<MenuComponent>;

	isHidden: boolean;
	isMenuSelected: boolean;

	constructor() { }

	ngOnInit(): void {
		this.isHidden = false;
	}

	getMenuName() {
		return this.menu.menuName;
	}

	filterMenu(value): Array<MenuComponent> {
		const result = [];
		this.isHidden = false;
		if (this.menu.child.length === 0) {
			if (this.menu.menuName.toLowerCase().indexOf(value.toLowerCase()) > -1) {
				result.push(this);
			} else {
				this.isHidden = true;
			}
		} else {
			const groupResult = [];
			// this.menuGroupComponents.forEach((menuGroupComponent: MenuGroupComponent) => {
			for (const mc of this.menuComponents) {
				const menus = mc.filterMenu(value);
				groupResult.push(...menus);
			}
			// })
			if (groupResult.length > 0) {
				this.menu.visibility = 'expanded';
				result.push(...groupResult);
			} else {
				this.isHidden = true;
			}
		}
		return result;
	}

	select() {
		this.isMenuSelected = true;
	}

	unselect() {
		this.isMenuSelected = false;
	}

	click(menu) {
		if (menu.visibility !== 'no-child') {
			if (menu.visibility === 'expanded') {
				menu.visibility = 'collapsed';
			} else {
				menu.visibility = 'expanded';
			}
		} else {
			this.clicked.emit(menu);
		}
	}
}
