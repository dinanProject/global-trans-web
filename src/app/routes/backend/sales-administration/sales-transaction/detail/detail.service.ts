import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { OptionItem } from 'src/app/modules/option-dialog/option-dialog.component';
import { ApiService } from 'src/app/services/api.service';

export interface Trx {
	salesId: number;
	debtorId: number;
	fullName: string;
	genderId: number;
	genderName: string;
	dob: Date;
	formattedDob: string;
	pob: string;
	religionId: number;
	religionName: string;
	maritalStatusId: number;
	maritalStatusName: string;
	email: string;
	homePhone: string;
	mobilePhone: string;
	identityCode: string;
	npwp: string;
	identityAddress: string;
	identityProvinceName: string;
	identityCityName: string;
	identityDistrictName: string;
	identitySubdistrictId: number;
	identitySubdistrictName: string;
	mailingAddress: string;
	mailingProvinceName: string;
	mailingCityName: string;
	mailingDistrictName: string;
	mailingSubdistrictId: number;
	mailingSubdistrictName: string;
	occupationId: number;
	occupationName: string;
	companyName: string;
	companyAddress: string;
	companyPhone: string;
	companyFax: string;
	salesDate: Date;
	formattedSalesDate: string;
	unitId: number;
	unitName: string;
	unitTypeName: string;
	projectName: string;
	paymentPlanId: string;
	paymentPlanName: string;
	paymentMethodName: string;
	unitPrice: number;
	discountPercent: number;
	discountAmount: number;
	salesPrice: number;
	salesPropertyTypeId: number;
	salesPropertyTypeName: string;
	salesInhouseId: number;
	salesInhouseName: string;
	salesInhouseSupervisorName: string;
	salesInhouseManagerName: string;
	salesAgentId: number;
	salesAgentName: string;
	propertyAgentName: string;
	leadPropertyAgentId: number;
	leadPropertyAgentName: string;
	purposeOfPurchaseId: string;
	purposeOfPurchaseName: string;
	sourceOfFundId: string;
	sourceOfFundName: string;
	referenceId: string;
	referenceName: string;
	akadDate: Date;
	formattedAkadDate: string;
	akadRealizationDate: Date;
	formattedAkadRealizationDate: string;
	promo: string;
	notes: string;
	identityImagePath: string;
	npwpImagePath: string;
	proofOfTransferImagePath: string;
	sprFilePath: string;
	handOverDate: Date;
	formattedHandOverDate: string;
	salesRevisionId: number;
	revisionStatusId: number;
	revisionStatusName: string;
	revisionStatusDate: string;
	revisionStatusUser: string;
	revisionReason: string;
	formattedCancelationDate: string;
	cancelationUser: string;
	cancelationTypeId: number;
	cancelationTypeName: string;
	cancelationNotes: string;
}

export interface Regional {
	subdistrictId: number;
	subdistrictName: string;
	districtName: string;
	cityName: string;
	provinceName: string;
}
export interface Province {
	provinceId: number;
	provinceName: string;
}

export interface City {
	provinceId: number;
	cityId: number;
	cityName: string;
}

export interface District {
	cityId: number;
	districtId: number;
	districtName: string;
}

export interface Subdistrict {
	districtId: number;
	subdistrictId: number;
	subdistrictName: string;
}

export interface Unit {
	unitId: number;
	unitName: string;
	projectName: string;
	unitTypeName: string;
}

export interface SalesInhouse {
	salesInhouseId: number;
	employeeCode: string;
	fullName: string;
	salesInhouseTypeName?: string;
	supervisorName: string;
	smName: string;
}

export interface SalesAgent {
	salesAgentId: number;
	salesAgentCode?: string;
	fullName: string;
	propertyAgentName: string;
}

export interface Invoice {
	invoiceCode: string;
	invoiceDate: string;
	invoiceDescription: string;
	invoiceAmount: number;
	invoicePaidDate: string;
	invoicePaidAmount: number;
	invoiceOutstandingAmount: string;
}

export interface PaymentPlan {
	paymentPlanId: number;
	paymentPlanName: string;
	paymentMethodName: string;
	price: number;
}

export interface PaymentPlanDetail {
	paymentPlanDetailId: number;
	paymentPlanId: number;
	paymentDate?: Date;
	updatedPaymentDate?: Date;
	paymentSchemeId: number;
	paymentSchemeCode: string;
	paymentSchemeName: string;
	priceAmount: number;
	pricePercent: number;
	updatedPriceAmount: number;
	updatedPricePercent: number;
	numberOfInstall: number;
	interval: number;
	intervalTypeId: number;
	intervalFromId: number;
	deductFromId: number;
	deductAmount: number;
	deductPercent: number;
	paymentPlanTrxs: PaymentPlanTrx[];
	isPriceAmountEdited?: boolean;
	isPricePercentEdited?: boolean;
	sequence: number;
	isPaid: boolean;
}

export interface PaymentPlanTrx {
	sequence?: number;
	paymentDate?: Date;
	updatedPaymentDate?: Date;
	description?: string;
	updatedDescription?: string;
	priceAmount?: number;
	pricePercent?: number;
	updatedPriceAmount?: number;
	updatedPricePercent?: number;
	isPaid: boolean;
}

@Injectable({
	providedIn: 'root'
})
export class DetailService {

	constructor(
		private apiService: ApiService
	) { }

	getUnits(): Observable<Unit[]> {
		return this.apiService.get(`/backend/sales-administration/sales-transaction/unit`);
	}

	getTrx(salesId: number): Observable<Trx> {
		return this.apiService.get(`/backend/sales-administration/sales-transaction/${salesId}`);
	}

	getTrxInvoices(salesId: number): Observable<Invoice[]> {
		return this.apiService.get(`/backend/sales-administration/sales-transaction/${salesId}/invoice`);
	}

	getGenders(): Observable<OptionItem[]> {
		return this.apiService.get(`/backend/sales-administration/sales-transaction/gender`);
	}

	getReligions(): Observable<OptionItem[]> {
		return this.apiService.get(`/backend/sales-administration/sales-transaction/religion`);
	}

	getMaritalStatuses(): Observable<OptionItem[]> {
		return this.apiService.get(`/backend/sales-administration/sales-transaction/marital-status`);
	}

	getPaymentTypes(): Observable<OptionItem[]> {
		return this.apiService.get(`/backend/sales-administration/sales-transaction/payment-type`);
	}

	getProvinces(): Observable<Province[]> {
		return this.apiService.get(`/backend/sales-administration/sales-transaction/province`);
	}

	getCities(): Observable<City[]> {
		return this.apiService.get(`/backend/sales-administration/sales-transaction/city`);
	}

	getDistricts(): Observable<District[]> {
		return this.apiService.get(`/backend/sales-administration/sales-transaction/district`);
	}

	getSubdistricts(): Observable<Subdistrict[]> {
		return this.apiService.get(`/backend/sales-administration/sales-transaction/subdistrict`);
	}

	getOccupations(): Observable<OptionItem[]> {
		return this.apiService.get(`/backend/sales-administration/sales-transaction/occupation`);
	}

	getSalesPropertyTypes(): Observable<OptionItem[]> {
		return this.apiService.get(`/backend/sales-administration/sales-transaction/agent-property-type`);
	}

	getUnitLeadPropertyAgents(unitId: number): Observable<OptionItem[]> {
		return this.apiService.get(`/backend/sales-administration/sales-transaction/unit/${unitId}/lead-property-agent`);
	}

	getUnitPaymentPlans(unitId: number): Observable<PaymentPlan[]> {
		return this.apiService.get(`/backend/sales-administration/sales-transaction/unit/${unitId}/payment-plan`)
	}

	getUnitPaymentPlanDetails(unitId: number): Observable<PaymentPlanDetail[]> {
		return this.apiService.get(`/backend/sales-administration/sales-transaction/unit/${unitId}/payment-plan-detail`)
	}

	getTrxPaymentPlan(salesId: number): Observable<PaymentPlan> {
		return this.apiService.get(`/backend/sales-administration/sales-transaction/${salesId}/payment-plan`);
	}

	getTrxPaymentPlanDetails(salesId: number): Observable<PaymentPlanDetail[]> {
		return this.apiService.get(`/backend/sales-administration/sales-transaction/${salesId}/payment-plan-detail`);
	}

	getSalesInhouses(): Observable<SalesInhouse[]> {
		return this.apiService.get(`/backend/sales-administration/sales-transaction/sales-inhouse`);
	}

	getSalesAgents(): Observable<SalesAgent[]> {
		return this.apiService.get(`/backend/sales-administration/reservation/sales-agent`);
	}

	getPurposeOfPurchases(): Observable<OptionItem[]> {
		return this.apiService.get(`/backend/sales-administration/sales-transaction/purpose-of-purchase`);
	}

	insertPurposeOfPurchase(purposeOfPurchaseName: string): Observable<OptionItem> {
		return this.apiService.post(`/backend/sales-administration/sales-transaction/purpose-of-purchase`, {
			purposeOfPurchaseName
		});
	}

	getSourcesOfFund(): Observable<OptionItem[]> {
		return this.apiService.get(`/backend/sales-administration/sales-transaction/source-of-fund`);
	}

	insertSourceOfFund(sourceOfFundName: string): Observable<OptionItem> {
		return this.apiService.post(`/backend/sales-administration/sales-transaction/source-of-fund`, {
			sourceOfFundName
		});
	}

	getReferences(): Observable<OptionItem[]> {
		return this.apiService.get(`/backend/sales-administration/sales-transaction/reference`);
	}

	insertReference(referenceName: string): Observable<OptionItem> {
		return this.apiService.post(`/backend/sales-administration/sales-transaction/reference`, {
			referenceName
		});
	}

	akadRealization(salesId: number, data: any) {
		return this.apiService.put(`/backend/sales-administration/sales-transaction/${salesId}/akad-realization`, data);
	}

	handover(salesId: number, data: any) {
		return this.apiService.put(`/backend/sales-administration/sales-transaction/${salesId}/handover`, data);
	}

	revision(salesId: number, data: any) {
		return this.apiService.put(`/backend/sales-administration/sales-transaction/${salesId}/revision`, data);
	}

	approveRevision(salesId: number) {
		return this.apiService.put(`/backend/sales-administration/sales-transaction/${salesId}/approve-revision`);
	}

	cancelation(salesId: number, data: any) {
		return this.apiService.put(`/backend/sales-administration/sales-transaction/${salesId}/cancelation`, data);
	}

	cancelationApproval(salesId: number) {

	}
}
