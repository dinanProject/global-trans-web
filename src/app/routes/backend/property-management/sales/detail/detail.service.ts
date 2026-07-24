import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';


export interface Sales {
	fullName: string;
	genderName: string;
	formatedDob: string;
	pob: string;
	religionName: string;
	maritalStatusName: string;
	email: string;
	identityCode: string;
	npwp: string;
	homePhone: string;
	handPhone: string;
	identityAddress: string;
	identitySubdistrictName: string;
	identityDistrictName: string;
	identityCityName: string;
	identityProvinceName: string;
	mailingAddress: string;
	mailingSubdistrictName: string;
	mailingDistrictName: string;
	mailingCityName: string;
	mailingProvinceName: string;
	customerOccupationName: string;
	customerCompanyName: string;
	customerCompanyAddress: string;
	customerCompanyPhone: string;
	customerCompanyFax: string;
	unitId: number;
	unitName: string;
	projectId: number;
	projectName: string;
	paymentMethodId: number;
	paymentPlanName: string;
	unitPrice: number;
	discountPercent: number;
	discountAmount: number;
	salesPrice: number;
	promo: string;
	remark: string;
	agentPropertyTypeName: string;
	salesName: string;
	salesSupervisorName: string;
	salesManagerName: string;
	agentPropertyTypeId: number;
	agentPropertyName: string;
	agentPropertyLeadName: string;
	agentPropertyOfficePhone: string;
	agentPropertySalesPhone: string;
	purposeOfPurchaseName: string;
	purposeOfPurchaseRemark: string;
	sourceOfFundsName: string;
	sourceOfFundsRemark: string;
	productReferenceName: string;
	productReferenceRemark: string;
	// TODO: delete ktpImagePath
	ktpImagePath: string;
	identityImagePath: string;
	npwpImagePath: string;
	proofOfTransferImagePath: string;
	akadDate: string;
	akadRealizationDate: string;
	handoverDate: string;
	cancelationDate: string;
}

// export interface BillingSchedule {
// 	paymentDate: string;
// 	paymentSchemeName: string;
// 	priceAmount: number;
// }

export interface DebtorsAccount {
	invoiceDate: string;
	invoiceDescription: string;
	invoiceAmount: number;
}

@Injectable({
	providedIn: 'root'
})
export class DetailService {

	constructor(
		private apiService: ApiService
	) { }

	getSales(salesId: number): Observable<{ sales: Sales, debtorsAccounts: DebtorsAccount[] }> {
		return this.apiService.get(`/backend/property-management/sales/${salesId}`);
	}

	cancel(salesId: number, data: any) {
		return this.apiService.put(`/backend/property-management/sales/${salesId}/cancelation`, data);
	}

	approveCancelation(salesId: number) {
		return this.apiService.post(`/backend/property-management/sales/${salesId}/approve-cancelation`);
	}

	processAkad(salesId: number, data) {
		return this.apiService.post(`/backend/property-management/sales/${salesId}/akad-process`, data);
	}

	processHandover(salesId: number, data) {
		return this.apiService.post(`/backend/property-management/sales/${salesId}/handover-process`, data);
	}

	printSpr(salesId: number) {
		return this.apiService.post(`/backend/property-management/sales/${salesId}/print-spr`);
	}

	revision(salesId: number, data) {
		return this.apiService.put(`/backend/property-management/sales/${salesId}/revision`, data);
	}

	approveRevision(salesId: number) {
		return this.apiService.post(`/backend/property-management/sales/${salesId}/approve-revision`);
	}
}
