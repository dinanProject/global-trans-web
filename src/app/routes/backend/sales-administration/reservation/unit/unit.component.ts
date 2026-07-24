import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Unit } from '../detail/detail.service';
import { UnitService } from './unit.service';

@Component({
	selector: 'app-unit',
	templateUrl: './unit.component.html',
	styleUrls: ['./unit.component.scss']
})
export class UnitComponent implements OnInit {

	isInitialized: boolean;
	dataSource: MatTableDataSource<Unit> = new MatTableDataSource();
	displayedColumns = ['no', 'unitName', 'actions'];

	constructor(
		private unitService: UnitService,
		private dialogRef: MatDialogRef<UnitComponent>,
	) { }

	ngOnInit(): void {
		this.isInitialized = false;
		this.getUnits();
	}

	getUnits() {
		this.unitService.getUnits()
			.toPromise()
			.then((units: Unit[]) => {
				this.dataSource.data = units;
				this.isInitialized = true;
			})
	}

	searchChanged(value: string) {
		this.dataSource.filter = value.toLowerCase();
	}

	select(unit: Unit) {
		this.dialogRef.close(unit);
	}
}
