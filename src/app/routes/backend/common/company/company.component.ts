import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { CompanyService } from './company.service';
import { DetailComponent, DialogAction } from './detail/detail.component';

export interface Company {
	companyId: number;
	companyName: string;
	remark: string;
	parentId: number;
	sequence: number;
	level: number;
	child: Company[];
}


export interface EventData {
	id: number;
	name: string;
}

@Component({
	selector: 'app-company',
	templateUrl: './company.component.html',
	styleUrls: ['./company.component.scss']
})
export class CompanyComponent implements OnInit {

	// displayedColumns = ['no', 'companyName', 'address', 'actions'];
	// dataSource = new MatTableDataSource();
	companies: Company[] = [];

	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

	constructor(
		private companyService: CompanyService,
		private dialog: MatDialog
	) { }

	ngOnInit(): void {
		this.getCompanies();
	}

	getCompanies() {
		this.companyService.getCompanies().subscribe((companies: Company[]) => {
			console.log(companies);
			this.companies = companies;
			// this.dataSource.data = result;
			// this.dataSource.paginator = this.paginator;
		})
	}

	applyFilter(e: Event) {
		// this.dataSource.filter = (e.target as HTMLInputElement).value.trim().toLowerCase();
		// if (this.dataSource.paginator) {
		// 	this.dataSource.paginator.firstPage();
		// }
	}

	openDialog(companyId: number = null) {
		this.dialog.open(DetailComponent, {
			width: '400px',
			data: {
				companyId
			}
		}).afterClosed().subscribe(result => {
			if (result) {
				this.getCompanies();
			}
		})
	}

	addCompany() {
		this.dialog
			.open(DetailComponent, {
				width: '360px',
				height: '400px',
				data: {
					dialogAction: DialogAction.Add,
					companyId: null
				}
			})
			.afterClosed()
			.subscribe(result => {
				if (result) {
					console.log(result);
					this.ngOnInit();
				}
			})
	}

	// editCompany(companyId) {
	// 	this.openDialog(companyId);
	// }

	// deleteCompany(companyId) {
	// 	if (confirm('Are you sure you want to delete current company?')) {
	// 		this.companyService.deleteCompany(companyId).subscribe(() => {
	// 			this.getCompanies();
	// 		})
	// 	}
	// }

	companyAdded(companyId: number) {
		this.dialog
			.open(DetailComponent, {
				width: '360px',
				height: '400px',
				data: {
					dialogAction: DialogAction.Add,
					companyId: companyId
				}
			})
			.afterClosed()
			.subscribe(result => {
				if (result) {
					console.log(result);
					this.ngOnInit();
				}
			})
	}

	companyEdited(companyId: number) {
		this.dialog
			.open(DetailComponent, {
				width: '300px',
				height: '400px',
				data: {
					dialogAction: DialogAction.Edit,
					companyId: companyId
				}
			})
			.afterClosed()
			.subscribe(result => {
				if (result) {
					console.log(result);
					this.ngOnInit();
				}
			})
	}

	companyDeleted(companyId: number) {
		if (!confirm('Delete current company ?')) {
			return;
		}

		this.companyService.deleteCompany(companyId).subscribe(result => {
			this.getCompanies();
		})
	}
}
