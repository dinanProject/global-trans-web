import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

@Injectable({
	providedIn: 'root'
})
export class DetailService {

	constructor(
		private apiService: ApiService
	) { }

	getCompany(companyId: number) {
		return this.apiService.get(`/backend/hr/department-and-occupation/company/${companyId}`);
	}

	insertCompany(data: any) {
		return this.apiService.post(`/backend/hr/department-and-occupation/company`, data);
	}

	updateCompany(companyId: number, data: any) {
		return this.apiService.put(`/backend/hr/department-and-occupation/company/${companyId}`, data);
	}

	getDepartment(departmentId: number) {
		return this.apiService.get(`/backend/hr/department-and-occupation/department/${departmentId}`);
	}
}
