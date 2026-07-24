import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';

export interface Sales {
	salesId: number;
	salesDate: string;
	fullName: string;
	projectName: string;
	unitName: string;
	paymentMethodName: string;
	salesName: string;
	agentPropertyName: string;
	salesPrice: number;
	paidAmount: number;
	paidPercent: number;
	currentInvoiceDescription: string;
	currentInvoiceDate: string;
	currentInvoiceOutstandingAmount: number;
}

@Injectable({
	providedIn: 'root'
})
export class DebtorsAccountService {

	constructor(
		private apiService: ApiService
	) { }

	getSales(): Observable<Sales[]> {
		return this.apiService.get(`/backend/ar/debtors-account`);
	}
}
