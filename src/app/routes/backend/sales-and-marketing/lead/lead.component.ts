import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { AddComponent } from './add/add.component';
import { Lead, LeadCategory, LeadService, LeadStatus } from './lead.service';
import { SalesComponent } from './sales/sales.component';

export interface Filter {
	search: string;
	categoryName: string;
	statusName: string;
}

@Component({
	selector: 'app-lead',
	templateUrl: './lead.component.html',
	styleUrls: ['./lead.component.scss']
})
export class LeadComponent implements OnInit {

	isInitialized: boolean;

	dataSource: MatTableDataSource<Lead> = new MatTableDataSource();
	displayedColumns = [
		'no',
		'fullName',
		'locationName',
		'registeredDate',
		'categoryName',
		'statusName',
		'salesName',
		'actions'
	];

	@ViewChild(MatPaginator) private paginator: MatPaginator;

	leadCategories: LeadCategory[] = [];
	leadStatuses: LeadStatus[] = [];

	categories: string[];
	statuses: string[];

	filter: Filter = {
		search: '',
		categoryName: '',
		statusName: ''
	}

	constructor(
		private leadService: LeadService,
		private dialog: MatDialog
	) { }

	ngOnInit(): void {
		this.isInitialized = false;
		this.getLeads();
	}

	getLeads() {
		return this.leadService.getLeads()
			.toPromise()
			.then((leads: Lead[]) => {
				leads = leads.map((lead: Lead, i) => Object.assign(lead, { no: i + 1 }));

				this.categories = leads.map((lead: Lead) => lead.categoryName).filter((value, index, self) => self.indexOf(value) === index);
				this.statuses = leads.map((lead: Lead) => lead.statusName).filter((value, index, self) => self.indexOf(value) === index);

				this.dataSource.data = leads;
				this.dataSource.filterPredicate = this.customFilter();
				this.dataSource.filter = JSON.stringify(this.filter);
				this.dataSource.paginator = this.paginator;
				this.isInitialized = true;
			})
	}

	getLeadCategories() {
		return this.leadService.getLeadCategories()
			.toPromise()
			.then((leadCategories: LeadCategory[]) => {
				this.leadCategories = leadCategories;
			})
	}

	getLeadStatuses() {
		return this.leadService.getLeadStatuses()
			.toPromise()
			.then((leadStatuses: LeadStatus[]) => {
				this.leadStatuses = leadStatuses;
			})
	}

	searchChanged(value: string) {
		const search = value.trim().toLowerCase();
		this.filter.search = search;
		this.dataSource.filter = JSON.stringify(this.filter);
	}

	categoryChanged(categoryName: string) {
		this.filter.categoryName = categoryName;
		this.dataSource.filter = JSON.stringify(this.filter);
	}

	statusChanged(statusName: string) {
		this.filter.statusName = statusName;
		this.dataSource.filter = JSON.stringify(this.filter);
	}

	customFilter() {
		const _filter = (data: Lead, filter: string): boolean => {
			const parsedFilter = JSON.parse(filter);
			return (parsedFilter.search ?
				(data.fullName.toLowerCase().trim().indexOf(parsedFilter.search.toLowerCase().trim()) !== -1) ||
				(data.phoneNumber.toLowerCase().trim().indexOf(parsedFilter.search.toLowerCase().trim()) !== -1)
				: true) &&
				(parsedFilter.categoryName === '' ? true : (data.categoryName === parsedFilter.categoryName)) &&
				(parsedFilter.statusName === '' ? true : (data.statusName === parsedFilter.statusName));
		};

		return _filter;
	}

	addLead() {
		this.dialog
			.open(AddComponent, {
				width: '300px',
				height: '408px',
				data: {}
			})
			.afterClosed()
			.subscribe(result => {
				if (result) {
					this.ngOnInit();
				}
			});
	}

	assign(lead: Lead) {
		this.dialog
			.open(SalesComponent, {
				width: '400px',
				height: '595px',
				data: {
					lead
				}
			})
			.afterClosed()
			.subscribe((result) => {
				if (result) {
					this.getLeads();
				}
			});
	}
}
