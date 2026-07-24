import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { BackendService } from '../../backend.service';
import { SalesTransactionService, Trx } from './sales-transaction.service';

@Component({
	selector: 'app-sales-transaction',
	templateUrl: './sales-transaction.component.html',
	styleUrls: ['./sales-transaction.component.scss']
})
export class SalesTransactionComponent implements OnInit {

	isInitialized: boolean = false;
	dataSource: MatTableDataSource<Trx> = new MatTableDataSource();
	// displayedColumns = ['no', 'salesDate', 'unitName', 'customerName', 'salesPrice', 'salesName', 'akadDate', 'handOverDate', 'actions'];
	displayedColumns = ['no', 'salesDate', 'unitName', 'salesPrice', 'salesName', 'akadDate', 'handOverDate', 'actions'];
	@ViewChild(MatPaginator) private paginator: MatPaginator;

	constructor(
		private salesTransactionService: SalesTransactionService,
		private backendService: BackendService
	) { }

	ngOnInit(): void {
		// this.backendService.hideSidebar()
		// 	.then(() => this.getSalesTransactions())
		// 	.then(() => this.isInitialized = true);
		this.getSalesTransactions()
			.then(() => this.isInitialized = true);
	}

	searchChanged(value: string) {
		this.dataSource.filter = value;
	}

	getSalesTransactions() {
		return this.salesTransactionService.getSalesTransactions()
			.toPromise()
			.then((trxs: Trx[]) => {
				this.dataSource.data = trxs.map((t: Trx, i: number) => Object.assign(t, {
					no: i + 1
				}));
				this.dataSource.paginator = this.paginator;
			})
	}
}
