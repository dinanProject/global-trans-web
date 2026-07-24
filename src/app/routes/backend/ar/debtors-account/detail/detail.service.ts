import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';

export interface Sales {
	fullName: string;
	identityAddress: string;
	mailingAddress: string;
	identityCode: string;
	npwp: string;
	homePhone: string;
	customerCompanyPhone: string;
	handPhone: string;
	email: string;
	paymentPlanName: string;
	paidAmount: number;
	paidPercent: number;
	outstandingAmount: number;
	projectName: string;
	unitTypeName: string;
	unitName: string;
	lt: number;
	lb: number;
	salesPrice: number;
	salesName: string;
	agentPropertyName: string;
}

@Injectable({
	providedIn: 'root'
})
export class DetailService {

	constructor(
		private apiService: ApiService
	) { }

	getSales(salesId: number): Observable<Sales> {
		return this.apiService.get(`/backend/ar/debtors-account/${salesId}`);
	}
}
