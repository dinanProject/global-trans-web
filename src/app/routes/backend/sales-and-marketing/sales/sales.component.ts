import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AddComponent } from './add/add.component';
import { Sales, SalesService } from './sales.service';

@Component({
	selector: 'app-sales',
	templateUrl: './sales.component.html',
	styleUrls: ['./sales.component.scss']
})
export class SalesComponent implements OnInit {

	dataSource: MatTableDataSource<Sales> = new MatTableDataSource();
	displayedColumns = ['no', 'fullName', 'salesInhouseTypeName', 'teamName', 'activeDate', 'actions'];
	@ViewChild(MatPaginator) private paginator: MatPaginator;
	@ViewChild(MatSort) private sort: MatSort;

	isInitialized: boolean;

	constructor(
		private salesService: SalesService,
		private dialog: MatDialog
	) { }

	ngOnInit(): void {
		this.isInitialized = false;
		this.getSaleses()
			.then(() => {
				this.isInitialized = true;
			})
	}

	getSaleses() {
		return this.salesService.getSaleses()
			.toPromise()
			.then((saleses: Sales[]) => {
				this.dataSource.data = saleses;
				this.dataSource.paginator = this.paginator;
				this.dataSource.sort = this.sort;
			});
	}

	searchChanged(value: string) {
		this.dataSource.filter = value.toLowerCase().trim();
	}

	addSales() {
		this.dialog
			.open(AddComponent, {
				width: '360px',
				height: '408px',
				data: {
					existingSales: this.dataSource.data.map((sales: Sales) => sales.salesInhouseId)
				}
			})
			.afterClosed()
			.subscribe((result) => {
				if (result) {
					this.getSaleses();
				}
			})
	}

	salesRegistration() {

	}
}
