import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';

export interface Trx {
	no?: number;
	salesId: number;
	salesDate: string;
	customerName: string;
	projectName: string;
	unitName: string;
	salesPrice: number;
	paymentMethodName: string;
	salesName: string;
	organizationName: string;
	leadPropertyAgentName: string;
	akadDate: string;
	akadDaysRemaining: string;
	akadDescription: string;
	akadRealizationDate: string;
	handOverDate: string;
	sprFilePath: string;
}

@Injectable({
	providedIn: 'root'
})
export class SalesTransactionService {

	constructor(
		private apiService: ApiService
	) { }

	getSalesTransactions(): Observable<Trx[]> {
		return this.apiService.get(`/backend/sales-administration/sales-transaction`);
	}
}
