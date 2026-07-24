import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

@Injectable({
	providedIn: 'root'
})
export class SalesService {

	constructor(
		private apiService: ApiService
	) { }

	getPeriode() {
		return this.apiService.get(`/backend/property-management/report/sales/periode`);
	}

	getSales(year: number, monthId?: number) {
		let param = `?year=${year}`;
		if (monthId) {
			param += `&month=${monthId}`;
		}
		return this.apiService.get(`/backend/property-management/report/sales${param}`);
	}
}
