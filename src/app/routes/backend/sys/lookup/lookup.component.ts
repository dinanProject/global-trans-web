import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { DetailComponent } from './detail/detail.component';
import { LookupService } from './lookup.service';

@Component({
	selector: 'app-lookup',
	templateUrl: './lookup.component.html',
	styleUrls: ['./lookup.component.scss']
})
export class LookupComponent implements OnInit {

	displayedColumns = ['no', 'lookupId', 'lookupName', 'lookupValue', 'lookupGroup', 'actions'];
	dataSource = new MatTableDataSource();
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

	constructor(
		private lookupService: LookupService,
		private dialog: MatDialog
	) { }

	ngOnInit(): void {
		this.getLookups();
	}

	getLookups() {
		this.lookupService.getLookups().subscribe(result => {
			console.log('getLookups result', result);
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

	openDialog(data = {}) {
		this.dialog.open(DetailComponent, {
			width: '400px',
			data
		}).afterClosed().subscribe((result) => {
			if (result) {
				this.getLookups();
			}
		})
	}

	addLookup() {
		this.openDialog();
	}

	editLookup(data) {
		this.openDialog(data);
	}

	deleteLookup(lookupId) {
		if (confirm('Are you sure you want to delete current lookup?')) {
			this.lookupService.deleteLookup(lookupId).subscribe(() => {
				this.getLookups();
			})
		}
	}
}
