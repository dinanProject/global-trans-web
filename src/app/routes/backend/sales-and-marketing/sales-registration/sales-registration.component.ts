import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { environment as env } from 'src/environments/environment';
import { LinkComponent } from './link/link.component';
import { SalesRegistrationService, SalesRegistration } from './sales-registration.service';

@Component({
	selector: 'app-sales-registration',
	templateUrl: './sales-registration.component.html',
	styleUrls: ['./sales-registration.component.scss']
})
export class SalesRegistrationComponent implements OnInit {

	apiUrl: string = env.apiUrl;
	registrations: MatTableDataSource<SalesRegistration> = new MatTableDataSource();
	displayedColumns = ['no', 'salesName', 'formattedExpiredDate', 'registrationStatusName', 'actions'];
	@ViewChild(MatPaginator) private paginator: MatPaginator;

	constructor(
		private dialog: MatDialog,
		private salesRegistrationService: SalesRegistrationService,
	) { }

	ngOnInit(): void {
		this.getUserRegistrations();
	}

	searchChanged(value: string) {

	}

	getUserRegistrations() {
		this.salesRegistrationService.getUserRegistrations()
			.toPromise()
			.then((userRegistrations: SalesRegistration[]) => {
				this.registrations.data = userRegistrations;
				this.registrations.paginator = this.paginator;
			});
	}


	get appUrl() {
		return window.location.protocol + '://' + window.location.host;
	}

	createLink() {
		this.dialog
			.open(LinkComponent, {
				width: '340px',
				data: {}
			})
			.afterClosed()
			.subscribe((result) => {
				this.getUserRegistrations();
			})
	}

	viewLink(registration: SalesRegistration) {
		this.dialog
			.open(LinkComponent, {
				width: '340px',
				data: {
					registrationId: registration.registrationId
				}
			})
			.afterClosed()
			.subscribe((result) => {

			})
	}

}
