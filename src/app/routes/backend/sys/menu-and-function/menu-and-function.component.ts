import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DetailComponent } from './detail/detail.component';
import { MenuAndFunctionService } from './menu-and-function.service';

@Component({
	selector: 'app-menu-and-function',
	templateUrl: './menu-and-function.component.html',
	styleUrls: ['./menu-and-function.component.scss']
})
export class MenuAndFunctionComponent implements OnInit {

	menus: Array<any> = [];

	constructor(
		private menuAndFunctionService: MenuAndFunctionService,
		private dialog: MatDialog
	) { }

	ngOnInit(): void {
		this.getMenusAndFunctions();
	}

	search(e: Event) {

	}

	openDialog(menuId = 0, mode: 'add' | 'edit') {
		this.dialog.open(DetailComponent, {
			width: '340px',
			data: {
				menuId,
				mode
			}
		}).afterClosed().subscribe(result => {
			if (result) {
				this.getMenusAndFunctions();
			}
		});
	}

	addMenu(menuId = 0) {
		this.openDialog(menuId, 'add');
	}

	editMenu(menuId) {
		this.openDialog(menuId, 'edit');
	}

	deleteMenu(menuId) {
		console.log('delete', menuId);
		if (!confirm('Are you sure you want to delete current menu ?')) {
			return;
		}

		this.menuAndFunctionService.deleteMenu(menuId).subscribe(() => {
			this.getMenusAndFunctions();
		})
	}

	getMenusAndFunctions() {
		this.menuAndFunctionService.getMenusAndFunctions().subscribe(result => {
			console.log('getMenusAndFunctions result', result);
			this.menus = result;
		})
	}
}
