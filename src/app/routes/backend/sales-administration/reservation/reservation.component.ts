import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { Unit } from './detail/detail.service';
import { Reservation, ReservationService } from './reservation.service';
import { UnitComponent } from './unit/unit.component';

@Component({
	selector: 'app-reservation',
	templateUrl: './reservation.component.html',
	styleUrls: ['./reservation.component.scss']
})
export class ReservationComponent implements OnInit {

	isInitialized: boolean;
	dataSource: MatTableDataSource<Reservation> = new MatTableDataSource();
	displayedColumns = ['no', 'reservationDate', 'unitName', 'fullName', 'salesName', 'reservationStatusName', 'actions'];
	@ViewChild(MatPaginator) private paginator: MatPaginator;
	@ViewChild(MatSort) private sort: MatSort;

	constructor(
		private activatedRoute: ActivatedRoute,
		private reservationService: ReservationService,
		private dialog: MatDialog,
		private router: Router
	) { }

	ngOnInit(): void {
		this.isInitialized = false;
		this.getReservations()
	}

	getReservations() {
		return this.reservationService.getReservations()
			.toPromise()
			.then((reservations: Reservation[]) => {
				console.log('reservations', reservations);
				this.dataSource.data = reservations;
				this.dataSource.paginator = this.paginator;
				this.dataSource.sort = this.sort;
				this.isInitialized = true;
			})
	}

	searchChanged(value: string) {
		console.log(value);
	}

	newReservation() {
		this.dialog
			.open(UnitComponent, {
				width: '400px'
			})
			.afterClosed()
			.subscribe((unit: Unit) => {
				if (unit) {
					console.log(unit);
					this.router.navigate(['new/' + unit.unitId], {
						relativeTo: this.activatedRoute
					})
				}
			})
	}
}
