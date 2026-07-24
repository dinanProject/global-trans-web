import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

export interface Recepient {
	recepientId: number;
	// personId: number;
	employeeId: number;
	fullName: string;
	email: string;
	recepientTypeId: number;
	recepientTypeName: string;
}

export interface Email {
	emailId: number;
	emailCode: string;
	emailName: string;
	recepients: Recepient[];
}

export interface EmailGroup {
	emailGroup: string;
	emails: Email[];
}

@Injectable({
	providedIn: 'root'
})
export class EmailService {

	constructor(
		private apiService: ApiService
	) { }

	getEmails() {
		return this.apiService.get(`/backend/sys/email`);
	}

	insertRecepient(emailId: number, employeeId: number) {
		return this.apiService.post(`/backend/sys/email/${emailId}/recepient`, {
			employeeId
		});
	}

	deleteRecepient(emailId: number, employeeId: number) {
		return this.apiService.delete(`/backend/sys/email/${emailId}/recepient/${employeeId}`);
	}
}
