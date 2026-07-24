import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { DetailService, Lead, Sales } from './detail.service';

@Component({
	selector: 'app-detail',
	templateUrl: './detail.component.html',
	styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {

	isInitialized: boolean;
	isActiveLeadsInitialized: boolean;
	isLeadsHistoryInitialized: boolean;
	salesInhouseId: number;
	sales: Sales;

	leads: MatTableDataSource<Lead> = new MatTableDataSource();
	leadsDisplayedColumns = [
		'no',
		'fullName',
		'categoryName',
		'statusName',
		'lastFollowUpDate',
		'nextFollowUpDate',
		'actions'
	];

	@ViewChild('leadsPaginator') private leadsPaginator: MatPaginator;

	leadsHistory: MatTableDataSource<Lead> = new MatTableDataSource();
	leadsHistoryDisplayedColumns = [
		'no',
		'fullName',
		'categoryName',
		'statusName',
		'lastFollowUpDate',
		'nextFollowUpDate',
		'actions'
	];

	@ViewChild('leadsHistoryPaginator') private leadsHistoryPaginator: MatPaginator;

	constructor(
		private activatedRoute: ActivatedRoute,
		private detailService: DetailService
	) { }

	ngOnInit(): void {
		this.isInitialized = false;
		this.isActiveLeadsInitialized = false;
		this.salesInhouseId = +this.activatedRoute.snapshot.paramMap.get('salesInhouseId');
		this.getSales()
			.then(() => this.getActiveLeads())
			.then(() => this.getLeadsHistory());
	}

	getSales() {
		this.isInitialized = false;
		return this.detailService.getSales(this.salesInhouseId)
			.toPromise()
			.then((sales: Sales) => {
				console.log('sales', sales);
				this.sales = sales;
				this.isInitialized = true;
			});
	}

	getActiveLeads() {
		this.isActiveLeadsInitialized = false;
		return this.detailService.getActiveLeads(this.salesInhouseId)
			.toPromise()
			.then((leads: Lead[]) => {
				this.leads.data = leads;
				this.leads.paginator = this.leadsPaginator;
				this.isActiveLeadsInitialized = true;
			})
	}

	getLeadsHistory() {
		this.isLeadsHistoryInitialized = false;
		return this.detailService.getLeadsHistory(this.salesInhouseId)
			.toPromise()
			.then((leads: Lead[]) => {
				this.leadsHistory.data = leads;
				this.leadsHistory.paginator = this.leadsPaginator;
				this.isLeadsHistoryInitialized = true;
			})
	}

}
