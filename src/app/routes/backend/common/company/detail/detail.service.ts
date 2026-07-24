import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

@Injectable({
	providedIn: 'root'
})
export class DetailService {

	constructor(
		private apiService: ApiService
	) { }

	getCompany(companyId) {
		return this.apiService.get(`/backend/common/company/${companyId}`);
	}

	insertCompany(data) {
		return this.apiService.post(`/backend/common/company`, data);
	}

	updateCompany(companyId, data) {
		return this.apiService.put(`/backend/common/company/${companyId}`, data);
	}
}
