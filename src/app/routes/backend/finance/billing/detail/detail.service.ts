import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

export interface Sales {
	salesId: number;
	fullName: string;
	identityAddress: string;
	mailingAddress: string;
	identityCode: string;
	npwp: string;
	homePhone: string;
	companyPhone: string;
	companyFax: string;
	handPhone: string;
	email: string;
	companyName: string;
	projectName: string;
	lt: number;
	lb: number;
	blockName: string;
	unitNo: string;
	unitName: string;
	unitTypeName: string;
	progressStatusName: string;
	unitPrice: number;
	salesPrice: number;
	agentPropertyTypeId: number;
	salesName: string;
	salesSupervisorName: string;
	salesManagerName: string;
	agentPropertyName: string;
	purposeOfPurchase: string;
	sourceOfFunds: string;
	productReference: string;
	paymentPlanName: string;
	paidAmount: number;
	paidPercent: number;
	currentBillingId: number;
}

export interface Billing {
	billingId: number;
	billingCode: string;
	billingDate: string;
	billingDescription: string;
	billingAmount: number;
	paymentAmount: number;
	paymentDate: string;
	fullName: string;
	unitName: string;
	projectName: string;
}

@Injectable({
	providedIn: 'root'
})
export class DetailService {

	constructor(
		private apiService: ApiService
	) { }

	getSales(salesId: number) {
		return this.apiService.get(`/backend/finance/billing/${salesId}`)
	}

	downloadExcel(salesId: number) {
		return this.apiService.get(`/backend/finance/billing/${salesId}/download-excel`);
	}

	downloadPdf(salesId: number) {
		return this.apiService.get(`/backend/finance/billing/${salesId}/download-pdf`);
	}
}
