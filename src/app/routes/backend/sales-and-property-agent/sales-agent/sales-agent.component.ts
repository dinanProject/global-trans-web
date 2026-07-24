import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { DetailComponent } from './detail/detail.component';
import { SalesAgent, SalesAgentService } from './sales-agent.service';

export interface QueryParams {
	search?: string;
	'page-index'?: number;
}

@Component({
	selector: 'app-sales-agent',
	templateUrl: './sales-agent.component.html',
	styleUrls: ['./sales-agent.component.scss']
})
export class SalesAgentComponent implements OnInit {

	isInitialized: boolean;

	dataSource: MatTableDataSource<SalesAgent> = new MatTableDataSource();
	displayedColumns = ['no', 'salesAgentCode', 'fullName', 'propertyAgentName', 'handPhone', 'actions'];
	@ViewChild(MatPaginator) private paginator: MatPaginator;

	queryParams: QueryParams = {
		search: '',
		'page-index': 0
	}

	constructor(
		private activatedRoute: ActivatedRoute,
		private salesAgentService: SalesAgentService,
		private dialog: MatDialog,
		private router: Router
	) { }

	ngOnInit(): void {
		this.isInitialized = false;
		this.queryParams['search'] = this.activatedRoute.snapshot.queryParamMap.get('search') || '';
		this.queryParams['page-index'] = +this.activatedRoute.snapshot.queryParamMap.get('page-index');
		console.log('this.queryParams', this.queryParams);
		this.getSalesAgents();
	}

	searchChanged(value: string) {
		const search = value.trim().toLowerCase();
		this.dataSource.filter = search;
		this.queryParams.search = search;
		this.updateUrl();
	}

	getSalesAgents() {
		return this.salesAgentService.getSalesAgents()
			.toPromise()
			.then((propertyAgents: SalesAgent[]) => {
				this.dataSource.data = propertyAgents.map((p: SalesAgent, i: number) => Object.assign({
					no: i + 1
				}, p));
				this.paginator.pageIndex = this.queryParams['page-index'];
				this.dataSource.paginator = this.paginator;
				this.dataSource.filter = this.queryParams.search.trim().toLowerCase();
				this.isInitialized = true;
			})
	}

	addSalesAgent() {
		this.dialog
			.open(DetailComponent, {
				width: '540px',
				data: {}
			})
			.afterClosed()
			.subscribe(result => {
				if (result) {
					this.getSalesAgents();
				}
			});
	}

	editSalesAgent(salesAgentId: number) {
		this.dialog
			.open(DetailComponent, {
				width: '540px',
				data: {
					salesAgentId
				}
			})
			.afterClosed()
			.subscribe(result => {
				if (result) {
					this.getSalesAgents();
				}
			});
	}

	pageChanged(event: PageEvent) {
		this.queryParams['page-index'] = event.pageIndex;
		this.updateUrl();
	}

	updateUrl() {
		this.router.navigate([], {
			queryParams: this.queryParams,
			queryParamsHandling: 'merge',
			replaceUrl: true,
		});
	}

}
