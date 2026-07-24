import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { SalesRevision, SalesRevisionService } from './sales-revision.service';

@Component({
	selector: 'app-sales-revision',
	templateUrl: './sales-revision.component.html',
	styleUrls: ['./sales-revision.component.scss']
})
export class SalesRevisionComponent implements OnInit {

	isInitialized: boolean = false;
	dataSource: MatTableDataSource<SalesRevision> = new MatTableDataSource();
	displayedColumns = ['no', 'salesDate', 'unitName', 'fullName', 'revisionStatusName', 'revisionReason', 'actions'];
	@ViewChild(MatPaginator) private paginator: MatPaginator;

	constructor(
		private salesRevisionService: SalesRevisionService
	) { }

	ngOnInit(): void {
		this.getSalesRevisions()
			.then(() => this.isInitialized = true);
	}

	searchChanged(value: string) {
		this.dataSource.filter = value?.toLowerCase().trim();
	}

	getSalesRevisions() {
		return this.salesRevisionService.getSalesRevisions()
			.toPromise()
			.then((salesRevisions: SalesRevision[]) => {
				console.log('salesRevisions', salesRevisions);
				this.dataSource.data = salesRevisions;
				this.dataSource.paginator = this.paginator;
			})
	}
}
