import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';

// export interface Employee {
// 	employeeId: number;
// 	employeeCode: string;
// 	fullName: string;
// }

export interface SalesInhouseType {
	salesInhouseTypeId: number;
	salesInhouseTypeName: string;
}

export interface Team {
	teamId: number;
	teamName: string;
}

@Injectable({
	providedIn: 'root'
})
export class AddService {

	constructor(
		private apiService: ApiService
	) { }

	getSalesInhouseTypes(): Observable<SalesInhouseType[]> {
		return this.apiService.get(`/backend/sales-and-marketing/sales/sales-type`);
	}

	getTeams(): Observable<Team[]> {
		return this.apiService.get(`/backend/sales-and-marketing/sales/team`);
	}

	insert(data: any) {
		return this.apiService.post(`/backend/sales-and-marketing/sales`, data);
	}
	// getEmployees(): Observable<Employee[]> {
	// 	return this.apiService.get(`/backend/sales-and-marketing/sales/employee`);
	// }

	// addSales(employeeId: number) {
	// 	return this.apiService.post(`/backend/sales-and-marketing/sales`, {
	// 		employeeId
	// 	});
	// }
}
