import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { DetailComponent } from './detail/detail.component';
import { UnitService } from './unit.service';

@Component({
	selector: 'app-unit',
	templateUrl: './unit.component.html',
	styleUrls: ['./unit.component.scss']
})
export class UnitComponent implements OnInit {

	projectId: number;

	displayedColumns = [
		'no',
		'unitName',
		'lt',
		'lb',
		'unitCategoryName',
		'unitTypeName',
		'salesStatusName',
		'progressStatusName',
		'lastModifiedUser',
		'actions'
	];

	dataSource = new MatTableDataSource();

	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

	constructor(
		private activatedRoute: ActivatedRoute,
		private unitService: UnitService,
		private dialog: MatDialog
	) { }

	ngOnInit(): void {
		this.projectId = +this.activatedRoute.snapshot.paramMap.get('projectId');
		this.getUnits();
	}

	getUnits() {
		this.unitService.getUnits(this.projectId).subscribe(result => {
			this.dataSource.data = result;
			this.dataSource.paginator = this.paginator;
		})
	}

	applyFilter(e: Event) {
		this.dataSource.filter = (e.target as HTMLInputElement).value.trim().toLowerCase();
		if (this.dataSource.paginator) {
			this.dataSource.paginator.firstPage();
		}
	}

	openDialog(unitId: number = null) {
		this.dialog.open(DetailComponent, {
			width: '400px',
			data: {
				projectId: this.projectId,
				unitId
			}
		}).afterClosed().subscribe(result => {
			if (result) {
				this.getUnits();
			}
		})
	}

	addUnit() {
		this.openDialog();
	}

	editUnit(unitId) {
		this.openDialog(unitId);
	}

	deleteUnit(unitId) {
		if (confirm('Are you sure you want to delete current unit?')) {
			this.unitService.deleteUnit(this.projectId, unitId).subscribe(() => {
				this.getUnits();
			})
		}
	}

}
