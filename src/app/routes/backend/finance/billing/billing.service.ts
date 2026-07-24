import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

export interface Billing {
	// billingId: number;
	// billingCode: string;
	// fullName: string;
	// unitName: string;
	// projectName: string;
	// billingDate: string;
	// billingDescription: string;
	// billingAmount: string;
	salesId: number;
	unitId: number;
	unitName: string;
	projectName: string;
	fullName: string;
	salesPrice: number;
	paymentPlanName: string;
	paidAmount: number;
	paidPercent: number;
	lastPaidBillingDescription: string;
	lastPaidBillingDate: string;
	lastPaidBillingAmount: number;
	nextBillingDescription: string;
	nextBillingDate: string;
	nextBillingAmount: number;
	nextOutstandingBillingAmount: number;
}

@Injectable({
	providedIn: 'root'
})
export class BillingService {

	constructor(
		private apiService: ApiService
	) { }

	getBillings() {
		return this.apiService.get(`/backend/finance/billing`);
	}
}
