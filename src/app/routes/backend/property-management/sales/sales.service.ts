import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';

export interface Year {
	year: number;
	months: Month[];
}

export interface Month {
	monthId: number;
	monthName: string;
}

export interface SalesMonth {
	monthName: string;
	totalUnit: number;
	totalAmount: number;
	salesList: Sales[];
}

export interface Sales {
	salesId: number;
	salesDate: string;
	fullName: string;
	unitName: string;
	projectName: string;
	salesPrice: number;
	paymentPlanName: string;
	salesName: string;
	agentProperty: string;
	agentPropertyName: string;
	agentPropertyLeadName: string;
	statusName: string;
	// productReferenceName: string;
	// billingDate: string;
	// billingStatus: string;
	cancelationDate: string;
	revisionDate: string;
	akadDaysRemaining: number;
	akadDescription: string;
	akadDate: string;
	akadRealizationDate: string;
	isSprPrinting?: boolean;
}
@Injectable({
	providedIn: 'root'
})
export class SalesService {

	constructor(
		private apiService: ApiService
	) { }

	// getSalesList() {
	// 	return this.apiService.get(`/backend/property-management/sales`);
	// }

	getPeriode(): Observable<Year[]> {
		return this.apiService.get(`/backend/property-management/sales/periode`);
	}

	getSales(year: number, monthId?: number): Observable<SalesMonth[]> {
		let param = `?year=${year}`;
		if (monthId) {
			param += `&month=${monthId}`;
		}
		return this.apiService.get(`/backend/property-management/sales${param}`);
	}

	printSpr(salesId: number) {
		return this.apiService.post(`/backend/property-management/sales/${salesId}/print-spr`);
	}

	exportToExcel() {
		return this.apiService.get(`/backend/property-management/sales/export-to-excel`);
	}
}
