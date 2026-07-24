import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Lead } from '../lead.service';
import { Sales, SalesService } from './sales.service';

@Component({
	selector: 'app-sales',
	templateUrl: './sales.component.html',
	styleUrls: ['./sales.component.scss']
})
export class SalesComponent implements OnInit {

	isInitialized: boolean;
	lead: Lead;
	dataSource: MatTableDataSource<Sales> = new MatTableDataSource();
	displayedColumns = ['no', 'fullName', 'actions'];

	salesInhouseTypeNames: string[] = [];

	constructor(
		@Inject(MAT_DIALOG_DATA) private data: { lead: Lead },
		private salesService: SalesService
	) { }

	ngOnInit(): void {
		this.isInitialized = false;
		this.lead = this.data.lead;
		this.getSaleses();
	}

	getSaleses() {
		return this.salesService.getSaleses()
			.toPromise()
			.then((saleses: Sales[]) => {
				saleses = saleses.map((sales: Sales, i: number) => Object.assign(sales, {
					no: i + 1
				}));

				this.salesInhouseTypeNames = saleses.map((sales: Sales) => sales.salesInhouseTypeName).filter((value, index, self) => self.indexOf(value) === index);
				this.dataSource.data = saleses;
				this.isInitialized = true;
			})
	}

	searchChanged(value: string) {

	}

	salesInhouseTypeChanged(salesInhouseTypeName: string) {

	}

	assign(sales: Sales) {
		sales.isAssigning = true;
		this.salesService.assign(this.lead.leadId, sales.salesInhouseId)
			.toPromise()
			.then(() => {

			});
	}
}
