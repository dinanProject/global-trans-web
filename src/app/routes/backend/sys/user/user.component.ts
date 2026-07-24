import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { UserService } from './user.service';

@Component({
	selector: 'app-user',
	templateUrl: './user.component.html',
	styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {

	displayedColumns = ['no', 'userName', 'formattedLastLoginDate', 'formattedLockedDate', 'actions'];
	dataSource = new MatTableDataSource();

	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild(MatSort, { static: true }) sort: MatSort;

	isInitialized = false;

	constructor(
		private userService: UserService
	) { }

	ngOnInit(): void {
		this.getUsers()
			.then(() => {
				this.isInitialized = true;
			});
	}

	getUsers() {
		return new Promise<void>((resolve, reject) => {
			this.userService.getUsers().subscribe(result => {
				console.log('get users result', result);
				this.dataSource.data = result;
				this.dataSource.paginator = this.paginator;
				this.dataSource.sort = this.sort;
				resolve();
			})
		});
	}

	resetPassword(userId: number) {
		this.userService.resetPassword(userId).subscribe(result => {
			alert('Password resetted');
			this.ngOnInit();
		})
	}

	searchChanged(e: Event) {
		this.dataSource.filter = (e.target as HTMLInputElement).value;
	}
}
