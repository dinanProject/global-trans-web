import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

@Injectable({
	providedIn: 'root'
})
export class DepartmentAndOccupationService {

	constructor(
		private apiService: ApiService
	) { }

	getCompanies() {
		return this.apiService.get(`/backend/hr/department-and-occupation/company`);
	}

	deleteCompany(companyId: number) {
		return this.apiService.delete(`/backend/hr/department-and-occupation/company/${companyId}`);
	}

	getDepartmentsAndOccupations() {
		return this.apiService.get(`/backend/hr/department-and-occupation/`);
	}
}
