import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { DetailComponent } from './detail/detail.component';
import { Email, EmailGroup, EmailService, Recepient } from './email.service';
import { RecepientComponent } from './recepient/recepient.component';
import { Employee } from './recepient/recepient.service';

@Component({
	selector: 'app-email',
	templateUrl: './email.component.html',
	styleUrls: ['./email.component.scss']
})
export class EmailComponent implements OnInit {

	isInitialized: boolean;
	// dataSource: MatTableDataSource<EmailGroup> = new MatTableDataSource();
	emailGroups: EmailGroup[] = [];

	constructor(
		private emailService: EmailService,
		private dialog: MatDialog
	) { }

	ngOnInit(): void {
		this.isInitialized = false;
		this.getEmails();
	}

	searchChanged(e: Event) {

	}

	add() {
		this.dialog
			.open(DetailComponent, {
				width: '600px',
				height: '700px',
				data: {}
			})
			.afterClosed()
			.subscribe(result => {
				if (result) {
					this.getEmails();
				}
			})
	}

	edit(emailId: number) {
		this.dialog
			.open(DetailComponent, {
				width: '600px',
				height: '700px',
				data: {
					emailId
				}
			})
			.afterClosed()
			.subscribe(result => {
				if (result) {
					this.getEmails();
				}
			})
	}

	getEmails() {
		this.emailService.getEmails().subscribe((emailGroups: EmailGroup[]) => {
			// this.dataSource.data = emails;
			console.log('emailGroups', emailGroups);
			this.emailGroups = emailGroups;
			this.isInitialized = true;
		})
	}

	getAddedEmployee(emailId: number) {
		let emails = [];
		for (const eg of this.emailGroups) {
			for (const e of eg.emails) {
				if (e.emailId === emailId) {
					for (const r of e.recepients) {
						console.log('r', r);
						emails.push(r.employeeId);
					}
				}
			}
		}
		return emails;
		// return this.emailGroups.map((g: EmailGroup) => g.emails.filter((e: Email) => +e.emailId === +emailId).map((e: Email) => e.recepients.map((r: Recepient) => r.employeeId)));
	}

	addRecepientTo(emailId: number) {
		this.dialog
			.open(RecepientComponent, {
				width: '400px',
				height: '448px',
				data: {
					emailId,
					recepientTypeId: 1,
					addedEmployees: this.getAddedEmployee(emailId)
				}
			})
			.afterClosed()
			.subscribe((employee: Employee) => {
				if (employee) {
					console.log('result', employee);
					// this.emailService.insertRecepient(email.emailId, employee.employeeId).subscribe(result => {
					this.getEmails();
					// })
				}
			})
	}

	addRecepientCc(emailId: number) {
		this.dialog
			.open(RecepientComponent, {
				width: '400px',
				height: '448px',
				data: {
					emailId,
					recepientTypeId: 2,
					addedEmployees: this.getAddedEmployee(emailId)
				}
			})
			.afterClosed()
			.subscribe((employee: Employee) => {
				if (employee) {
					console.log('result', employee);
					// this.emailService.insertRecepient(emailId, employee.employeeId).subscribe(result => {
					this.getEmails();
					// })
				}
			})
	}

	deleteRecepient(emailId: number, employeeId: number) {
		if (!confirm('Delete current recepient?')) {
			return;
		}

		this.emailService.deleteRecepient(emailId, employeeId).subscribe(result => {
			this.getEmails();
		})
	}

}
