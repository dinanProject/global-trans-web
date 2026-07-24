import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { LinkComponent } from './link/link.component';
import { UserRegistration, UserRegistrationService } from './user-registration.service';
import { environment as env } from 'src/environments/environment';
import { Location } from '@angular/common';


@Component({
	selector: 'app-user-registration',
	templateUrl: './user-registration.component.html',
	styleUrls: ['./user-registration.component.scss']
})
export class UserRegistrationComponent implements OnInit {

	apiUrl: string = env.apiUrl;
	userRegistrations: MatTableDataSource<UserRegistration> = new MatTableDataSource();
	displayedColumns = ['no', 'linkName', 'formattedExpiredDate', 'registrationStatusName', 'actions'];
	@ViewChild(MatPaginator) private paginator: MatPaginator;

	constructor(
		private dialog: MatDialog,
		private userRegistrationService: UserRegistrationService,
		private loc: Location
	) { }

	ngOnInit(): void {
		this.getUserRegistrations();
	}

	getUserRegistrations() {
		this.userRegistrationService.getUserRegistrations()
			.toPromise()
			.then((userRegistrations: UserRegistration[]) => {
				this.userRegistrations.data = userRegistrations;
				this.userRegistrations.paginator = this.paginator;
			});
	}


	get appUrl() {
		// const angularRoute = this.loc.path();
		// const url = window.location.href;
		// return url.replace(`#${angularRoute}`, '');
		return window.location.protocol + '://' + window.location.host;
	}

	createLink() {
		this.dialog
			.open(LinkComponent, {
				width: '360px', data: {
					mode: 'create'
				}
			})
			.afterClosed()
			.subscribe((result) => {
				this.getUserRegistrations();
			})
	}

	viewLink(userRegistration: UserRegistration) {
		this.dialog
			.open(LinkComponent, {
				width: '360px', data: {
					mode: 'view',
					link: this.appUrl + '/user-registration?token=' + userRegistration.token
				}
			})
			.afterClosed()
			.subscribe((result) => {

			})
	}
}
