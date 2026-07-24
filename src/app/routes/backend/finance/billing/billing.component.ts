import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Billing, BillingService } from './billing.service';
import { ProcessComponent } from './process/process.component';

@Component({
	selector: 'app-billing',
	templateUrl: './billing.component.html',
	styleUrls: ['./billing.component.scss']
})
export class BillingComponent implements OnInit {

	dataSource: MatTableDataSource<Billing> = new MatTableDataSource();
	// displayedColumns = ['no', 'billingCode', 'unitName', 'billingDate', 'billingAmount', 'actions'];
	displayedColumns = [
		'no',
		'unitName',
		'salesPrice',
		'paidAmount',
		'lastPaidBillingDate',
		'nextBillingDate',
		'actions'
	];

	isInitialized: boolean;

	@ViewChild(MatPaginator) private paginator: MatPaginator;
	@ViewChild(MatSort) private sort: MatSort;

	constructor(
		private billingService: BillingService,
		private dialog: MatDialog
	) { }

	ngOnInit(): void {
		this.getBillings();
	}

	getBillings() {
		this.isInitialized = false;
		this.billingService.getBillings().subscribe((billings: Billing[]) => {
			console.log('bills', billings);
			this.dataSource.data = billings;
			this.dataSource.paginator = this.paginator;
			this.dataSource.sort = this.sort;
			this.isInitialized = true;
		})
	}

	searchChanged(e: Event) {
		this.dataSource.filter = (e.target as HTMLInputElement).value.trim().toLowerCase();
		if (this.dataSource.paginator) {
			this.dataSource.paginator.firstPage();
		}
	}

	payment(billing: Billing) {
		console.log('bill', billing);
		this.dialog
			.open(ProcessComponent, {
				width: '400px',
				data: {
					billing: billing
				}
			})
			.afterClosed()
			.subscribe(result => {
				if (result) {
					this.getBillings();
				}
			})
	}
}
