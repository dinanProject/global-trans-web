import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { DetailComponent } from './detail/detail.component';
import { PropertyAgent, PropertyAgentService } from './property-agent.service';

export interface QueryParams {
	search?: string;
	'page-index'?: number;
}
@Component({
	selector: 'app-property-agent',
	templateUrl: './property-agent.component.html',
	styleUrls: ['./property-agent.component.scss']
})
export class PropertyAgentComponent implements OnInit {

	isInitialized: boolean;

	dataSource: MatTableDataSource<PropertyAgent> = new MatTableDataSource();
	displayedColumns = ['no', 'propertyAgentCode', 'propertyAgentName', 'remark', 'salesAgentCount', 'actions'];
	@ViewChild(MatPaginator) private paginator: MatPaginator;

	queryParams: QueryParams = {
		'page-index': 0
	}

	constructor(
		private propertyAgentService: PropertyAgentService,
		private dialog: MatDialog,
		private activatedRoute: ActivatedRoute,
		private router: Router
	) { }

	ngOnInit(): void {
		this.isInitialized = false;
		this.queryParams['search'] = this.activatedRoute.snapshot.queryParamMap.get('search') || '';
		this.queryParams['page-index'] = +this.activatedRoute.snapshot.queryParamMap.get('page-index');
		console.log('this.queryParams', this.queryParams);
		this.getPropertyAgents();
	}

	searchChanged(value: string) {
		console.log('value', value);
		const search = value.trim().toLowerCase();
		this.dataSource.filter = search;
		this.queryParams.search = search;
		this.updateUrl();
	}

	getPropertyAgents() {
		return this.propertyAgentService.getPropertyAgents()
			.toPromise()
			.then((propertyAgents: PropertyAgent[]) => {
				this.dataSource.data = propertyAgents.map((p: PropertyAgent, i: number) => Object.assign({
					no: i + 1
				}, p));
				this.paginator.pageIndex = this.queryParams['page-index'];
				this.dataSource.paginator = this.paginator;
				this.dataSource.filter = this.queryParams.search.trim().toLowerCase();
				this.isInitialized = true;
			})
	}

	addPropertyAgent() {
		this.dialog
			.open(DetailComponent, {
				width: '800px',
				data: {}
			})
			.afterClosed()
			.subscribe((result) => {
				this.getPropertyAgents();
			});
	}

	editPropertyAgent(propertyAgentId: number) {
		this.dialog
			.open(DetailComponent, {
				width: '800px',
				data: {
					propertyAgentId
				}
			})
			.afterClosed()
			.subscribe((result) => {
				this.getPropertyAgents();
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
