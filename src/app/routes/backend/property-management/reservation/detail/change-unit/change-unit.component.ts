import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ChangeUnitService, Unit } from './change-unit.service';

@Component({
	selector: 'app-change-unit',
	templateUrl: './change-unit.component.html',
	styleUrls: ['./change-unit.component.scss']
})
export class ChangeUnitComponent implements OnInit {

	dataSource: MatTableDataSource<Unit> = new MatTableDataSource();
	displayedColumns = ['no', 'unitName', 'lt', 'lb', 'cashPrice', 'actions'];

	isInitialized: boolean;

	constructor(
		@Inject(MAT_DIALOG_DATA) private data: { unitId: number },
		private changeUnitService: ChangeUnitService,
		private dialogRef: MatDialogRef<ChangeUnitComponent>
	) { }

	ngOnInit(): void {
		this.isInitialized = false;
		this.getUnits();
	}

	getUnits() {
		return this.changeUnitService.getUnits()
			.toPromise()
			.then((units: Unit[]) => {
				this.dataSource.data = units.filter((unit: Unit) => +unit.unitId !== +this.data.unitId);
				this.isInitialized = true;
			})
	}

	select(unit: Unit) {
		this.dialogRef.close(unit);
	}
}
