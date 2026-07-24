import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { DebtorsAccountService, Sales } from './debtors-account.service';

@Component({
	selector: 'app-debtors-account',
	templateUrl: './debtors-account.component.html',
	styleUrls: ['./debtors-account.component.scss']
})
export class DebtorsAccountComponent implements OnInit {

	sales: MatTableDataSource<Sales> = new MatTableDataSource();
	displayedColumns = [
		'no',
		'unitName',
		'fullName',
		'paymentMethodName',
		'salesPrice',
		'paidAmount',
		'currentInvoiceDescription',
		'actions'
	];
	@ViewChild(MatPaginator) paginator: MatPaginator;

	isInitialized: boolean;

	constructor(
		private debtorsAccountService: DebtorsAccountService
	) { }

	ngOnInit(): void {
		this.getSales();
	}

	getSales() {
		this.isInitialized = false;
		return this.debtorsAccountService.getSales()
			.toPromise()
			.then((sales: Sales[]) => {
				console.log('sales', sales);
				this.sales.data = sales;
				this.sales.paginator = this.paginator;
				this.isInitialized = true;
			})
	}

	searchChanged(e: Event) {

	}
}
