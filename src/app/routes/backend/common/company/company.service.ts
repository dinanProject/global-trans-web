import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

@Injectable({
	providedIn: 'root'
})
export class CompanyService {

	constructor(
		private apiService: ApiService
	) { }

	getCompanies() {
		return this.apiService.get(`/backend/common/company`);
	}

	deleteCompany(companyId) {
		return this.apiService.delete(`/backend/common/company/${companyId}`);
	}
}
