import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ParentService } from './parent.service';

@Component({
	selector: 'app-parent',
	templateUrl: './parent.component.html',
	styleUrls: ['./parent.component.scss']
})
export class ParentComponent implements OnInit {

	menus: Array<any> = [];
	selectedMenuId: number;

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: any,
		private parentService: ParentService,
		private dialogRef: MatDialogRef<ParentComponent>
	) { }

	ngOnInit(): void {
		this.selectedMenuId = this.data.parentId;
		this.getMenus()
	}

	getMenus() {
		this.parentService.getMenus().subscribe(result => {
			this.menus = result;
		})
	}

	select(menu) {
		this.dialogRef.close(menu);
	}
}
