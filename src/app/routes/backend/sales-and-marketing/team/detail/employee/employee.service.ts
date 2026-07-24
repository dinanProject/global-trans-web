import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';

export interface Employee {
	employeeId: number;
	employeeCode: string;
	fullName: string;
}

@Injectable({
	providedIn: 'root'
})
export class EmployeeService {

	constructor(
		private apiService: ApiService
	) { }

	getEmployees(): Observable<Employee[]> {
		return this.apiService.get(`/backend/sales-and-marketing/team/employee`);
	}
}
