import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { CancelationService } from './cancelation.service';

export interface CanceledUnit {
	salesCancelationId: number;
	unitId: number;
	unitName: string;
	projectName: string;
	fullName: string;
	salesName: string;
	agentPropertyName: string;
	cancelationReason: string;
	cancelationDate: string;
	cancelationUser: string;
}

@Component({
	selector: 'app-cancelation',
	templateUrl: './cancelation.component.html',
	styleUrls: ['./cancelation.component.scss']
})
export class CancelationComponent implements OnInit {

	isInitialized: boolean;
	dataSource: MatTableDataSource<CanceledUnit> = new MatTableDataSource();
	displayedColumns = ['no', 'cancelationDate', 'fullName', 'unitName', 'salesName', 'cancelationReason', 'actions'];
	@ViewChild(MatPaginator) private paginator: MatPaginator;

	constructor(
		private cancelationService: CancelationService
	) { }

	ngOnInit(): void {
		this.isInitialized = false;
		this.getCanceledUnits();
	}

	searchChanged(e: Event) {

	}

	getCanceledUnits() {
		return this.cancelationService.getCanceledUnits().subscribe((canceledUnits: CanceledUnit[]) => {
			console.log('canceledUnits', canceledUnits);
			this.dataSource.data = canceledUnits;
			this.dataSource.paginator = this.paginator;
			this.isInitialized = true;
		})
	}
}
