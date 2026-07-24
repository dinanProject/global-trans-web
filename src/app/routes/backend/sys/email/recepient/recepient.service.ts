import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

export interface Employee {
	employeeId: number;
	employeeCode: string;
	fullName: string;
	occupationName: string;
	isChecked: boolean;
}

@Injectable({
	providedIn: 'root'
})
export class RecepientService {

	constructor(
		private apiService: ApiService
	) { }

	getEmployees() {
		return this.apiService.get(`/backend/sys/email/employee`);
	}

	insertRecepient(emailId, recepientTypeId, recepients) {
		return this.apiService.post(`/backend/sys/email/${emailId}/recepient`, {
			recepientTypeId,
			recepients
		});
	}
}
