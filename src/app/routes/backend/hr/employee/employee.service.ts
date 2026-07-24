import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { ApiService } from 'src/app/services/api.service';

export interface Employee {
	employeeId: number;
	employeeCode: string;
	fullName: string;
	occupationName: string;
	departmentName: string;
	companyName: string;
}

@Injectable({
	providedIn: 'root'
})
export class EmployeeService {

	constructor(
		private apiService: ApiService
	) { }

	getEmployees(): Observable<Employee[]> {
		return this.apiService.get(`/backend/hr/employee`);
	}

	insertEmployee(data) {
		return this.apiService.post(`/backend/hr/employee`, data);
	}
}
