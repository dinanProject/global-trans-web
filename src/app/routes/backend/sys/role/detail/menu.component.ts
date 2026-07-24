import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { Menu } from './detail.component';

@Component({
	selector: 'menu-tree',
	templateUrl: './menu.component.html',
	styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {

	@Input() menu: Menu;
	@Output() changed = new EventEmitter<Menu>();
	@Output() indeterminateChanged = new EventEmitter<Menu>();

	constructor() { }

	ngOnInit(): void {

	}

	change(e: MatCheckboxChange) {
		this.menu.isChecked = e.checked;
		this.menu.child.forEach((m: Menu) => {
			m.isChecked = e.checked;
			m.isIndeterminate = false;
			this.checkChild(m, e.checked);
		});
		this.changed.emit(this.menu);
	}

	checkChild(menu: Menu, value: boolean) {
		for (const m of menu.child) {
			m.isChecked = value;
			m.isIndeterminate = false;
			this.checkChild(m, value);
		}
	}

	childChange(menu: Menu) {
		// re-set child array isChecked and isIndeterminate value
		const child = this.menu.child.find((m: Menu) => m.menuId === menu.menuId);
		child.isChecked = menu.isChecked;
		child.isIndeterminate = menu.isIndeterminate;

		// calculate checked child
		const childCount = this.menu.child.length;
		const checkedChildCount = this.menu.child.filter((m: Menu) => m.isChecked).length;
		const indeterminateChildCount = this.menu.child.filter((m: Menu) => m.isIndeterminate).length;
		if (checkedChildCount === childCount) {
			this.menu.isChecked = true;
			this.menu.isIndeterminate = false;
		} else if (checkedChildCount === 0) {
			this.menu.isChecked = false;
			this.menu.isIndeterminate = indeterminateChildCount > 0;
		} else {
			this.menu.isChecked = false;
			this.menu.isIndeterminate = true;
		}
		this.changed.emit(this.menu);
	}

	indeterminateChange(e) {
		this.indeterminateChanged.emit(this.menu);
	}

	childIndeterminateChange(menu: Menu) {
		setTimeout(() => {
			// re-set child array isChecked and isIndeterminate value
			const child = this.menu.child.find((m: Menu) => m.menuId === menu.menuId);
			child.isChecked = menu.isChecked;
			child.isIndeterminate = menu.isIndeterminate;

			// calculate checked child
			const childCount = this.menu.child.length;
			const checkedChildCount = this.menu.child.filter((m: Menu) => m.isChecked).length;
			const indeterminateChildCount = this.menu.child.filter((m: Menu) => m.isIndeterminate).length;
			if (checkedChildCount === childCount) {
				this.menu.isChecked = true;
				this.menu.isIndeterminate = false;
			} else if (checkedChildCount === 0) {
				this.menu.isChecked = false;
				this.menu.isIndeterminate = indeterminateChildCount > 0;
			} else {
				this.menu.isChecked = false;
				this.menu.isIndeterminate = true;
			}
			this.indeterminateChanged.emit(this.menu);
		})
	}
}
