import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { map } from 'rxjs/operators';
import { DetailComponent } from './detail/detail.component';
import { RoleService } from './role.service';

@Component({
	selector: 'app-role',
	templateUrl: './role.component.html',
	styleUrls: ['./role.component.scss']
})
export class RoleComponent implements OnInit {

	displayedColumns: Array<string> = ['no', 'roleName', 'remark', 'actions'];
	dataSource: MatTableDataSource<any> = new MatTableDataSource();
	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;

	constructor(
		private roleService: RoleService,
		private dialog: MatDialog
	) { }

	ngOnInit(): void {
		this.getRoles();
	}

	getRoles() {
		this.roleService.getRoles()
			.pipe(
				map(result => {
					console.log('getRoles result', result);
					this.dataSource.data = result;
					this.dataSource.paginator = this.paginator;
					this.dataSource.sort = this.sort;
				})
			)
			.toPromise();
	}

	openDialog(mode: 'add' | 'edit', roleId?: number) {
		return this.dialog.open(DetailComponent, {
			width: '700px',
			height: '615px',
			data: {
				roleId,
				mode
			}
		})
	}

	addRole() {
		this.openDialog('add')
			.afterClosed()
			.subscribe(result => {
				if (result) {
					this.ngOnInit();
				}
			});
	}

	editRole(roleId) {
		this.openDialog('edit', roleId)
			.afterClosed()
			.subscribe(result => {
				if (result) {
					this.ngOnInit();
				}
			});
	}

	deleteRole(roleId) {
		if (!confirm('Are you sure you want to delete current role?')) {
			return;
		}

		this.roleService.deleteRole(roleId).subscribe(() => {
			this.getRoles();
		})
	}

}
