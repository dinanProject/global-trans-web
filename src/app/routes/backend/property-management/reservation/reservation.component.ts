import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ReservationService } from './reservation.service';
import { environment as env } from 'src/environments/environment';

export interface Reservation {
	reservationId: number;
	formattedReservationDate: string;
	reservationStatusId: number;
	reservationStatusName: string;
	formattedReservationStatusName: string;
	paymentPlanStatusName: string;
	fullName: string;
	formattedAge: string;

	identityCode: string;
	unitName: string;
	projectName: string;
	unitCategoryName: string;
	unitTypeName: string;

	progressStatusName: string;
	paymentMethodName: string;
	cashPrice: number;

	isSprPrinting: boolean;
}

@Component({
	selector: 'app-reservation',
	templateUrl: './reservation.component.html',
	styleUrls: ['./reservation.component.scss']
})
export class ReservationComponent implements OnInit {

	apiUrl = env.apiUrl;

	dataSource: MatTableDataSource<Reservation> = new MatTableDataSource();
	displayedColumns = [
		'no',
		'formattedReservationDate',
		'unitName',
		'fullName',
		'progressStatusName',
		'unitPrice',
		'paymentMethodName',
		// 'paymentPlanStatusName',
		'reservationStatusName',
		'actions'
	]
	@ViewChild(MatPaginator) private paginator: MatPaginator;
	isInitialized: boolean;
	isSprPrinting: boolean;

	constructor(
		private reservationService: ReservationService
	) { }

	ngOnInit(): void {
		this.isInitialized = false;
		this.isSprPrinting = false;
		this.getReservations()
			.then(() => {
				this.isInitialized = true;
			})
	}

	searchChanged(value) {

	}

	getReservations() {
		return new Promise<void>((resolve, reject) => {
			this.reservationService.getReservations().subscribe((reservations: Array<Reservation>) => {
				console.log('reservations', reservations);
				this.dataSource.data = reservations;
				this.dataSource.paginator = this.paginator;
				resolve();
			})
		});
	}

	printSpr(row: Reservation) {
		row.isSprPrinting = true;
		this.reservationService.printSpr(row.reservationId).subscribe(result => {
			console.log(result);
			window.open(result);
			row.isSprPrinting = false;
		})
	}
}
