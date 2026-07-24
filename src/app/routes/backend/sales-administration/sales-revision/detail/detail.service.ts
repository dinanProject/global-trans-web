import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { OptionItem } from 'src/app/modules/option-dialog/option-dialog.component';
import { ApiService } from 'src/app/services/api.service';

export interface SalesRevision {
	salesRevisionId: number;
	fullName: string;
	genderId: number;
	dob: Date;
	pob: string;
	religionId: number;
	maritalStatusId: number;
	email: string;
	homePhone: string;
	mobilePhone: string;
	identityCode: string;
	npwp: string;
	identityAddress: string;
	identitySubdistrictId: number;
	mailingAddress: string;
	mailingSubdistrictId: number;
	occupationId: number;
	customerCompanyName: string;
	customerCompanyAddress: string;
	customerCompanyPhone: string;
	customerCompanyFax: string;

	salesDate: Date;
	unitId: number;
	unitTypeName: string;
	paymentPlanCode: string;
	unitPrice: number;
	discountPercent: number;
	discountAmount: number;
	salesPrice: number;

	akadDate: Date;
	salesPropertyTypeId: number;
	salesInhouseId: number;
	salesInhouseName: string;
	salesInhouseSupervisorName: string;
	salesInhouseManagerName: string;
	salesAgentId: number;
	salesAgentName: string;
	propertyAgentName: string;

	leadPropertyAgentId: number;

	purposeOfPurchaseId: number;
	purposeOfPurchaseName: string;
	sourceOfFundId: number;
	sourceOfFundName: string;
	referenceId: number;
	referenceName: string;
	promo: string;
	notes: string;

	identityImagePath: string;
	npwpImagePath: string;
	proofOfTransferImagePath: string;

	unitName: string;
	projectName: string;

	identityProvinceId: number;
	identityCityId: number;
	identityDistrictId: number;
	mailingProvinceId: number;
	mailingCityId: number;
	mailingDistrictId: number;
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
	unitTypeName: string;
	projectName: string;
}

export interface PaymentPlan {
	paymentPlanId: number;
	paymentPlanCode: string;
	paymentPlanName: string;
	paymentMethodId: number;
	paymentMethodName: string;
	price: number;
	isSaved: boolean;
}

export interface PaymentPlanDetail {
	paymentPlanDetailId: number;
	paymentPlanCode: string;
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

export interface SalesInhouse {
	salesInhouseId: number;
	fullName: string;
	supervisorName: string;
	smName: string;
	salesInhouseTypeName?: string;
}

export interface SalesAgent {
	salesAgentId: number;
	fullName: string;
	propertyAgentName: string;
}


@Injectable({
	providedIn: 'root'
})
export class DetailService {

	constructor(
		private apiService: ApiService
	) { }

	getSalesRevision(salesRevisionId: number): Observable<SalesRevision> {
		return this.apiService.get(`/backend/sales-administration/sales-revision/${salesRevisionId}`);
	}

	getGenders(): Observable<OptionItem[]> {
		return this.apiService.get(`/backend/sales-administration/sales-revision/gender`);
	}

	getReligions(): Observable<OptionItem[]> {
		return this.apiService.get(`/backend/sales-administration/sales-revision/religion`);
	}

	getMaritalStatuses(): Observable<OptionItem[]> {
		return this.apiService.get(`/backend/sales-administration/sales-revision/marital-status`);
	}

	getProvinces(): Observable<Province[]> {
		return this.apiService.get(`/backend/sales-administration/sales-revision/province`);
	}

	getCities(): Observable<City[]> {
		return this.apiService.get(`/backend/sales-administration/sales-revision/city`);
	}

	getDistricts(): Observable<District[]> {
		return this.apiService.get(`/backend/sales-administration/sales-revision/district`);
	}

	getSubdistricts(): Observable<Subdistrict[]> {
		return this.apiService.get(`/backend/sales-administration/sales-revision/subdistrict`);
	}

	getOccupations(): Observable<OptionItem[]> {
		return this.apiService.get(`/backend/sales-administration/sales-revision/occupation`);
	}

	getUnits(): Observable<Unit[]> {
		return this.apiService.get(`/backend/sales-administration/sales-revision/unit`);
	}

	getUnitPaymentPlans(unitId: number): Observable<PaymentPlan[]> {
		return this.apiService.get(`/backend/sales-administration/sales-revision/unit/${unitId}/payment-plan`)
	}

	getUnitPaymentPlanDetails(unitId: number): Observable<PaymentPlanDetail[]> {
		return this.apiService.get(`/backend/sales-administration/sales-revision/unit/${unitId}/payment-plan-detail`)
	}

	getSalesRevisionPaymentPlan(salesRevisionId: number): Observable<PaymentPlan> {
		return this.apiService.get(`/backend/sales-administration/sales-revision/${salesRevisionId}/payment-plan`);
	}

	getSalesRevisionPaymentPlanDetails(salesRevisionId: number): Observable<PaymentPlanDetail[]> {
		return this.apiService.get(`/backend/sales-administration/sales-revision/${salesRevisionId}/payment-plan-detail`);
	}

	getSalesPropertyTypes(): Observable<OptionItem[]> {
		return this.apiService.get(`/backend/sales-administration/sales-revision/sales-property-type`);
	}

	getSalesInhouses(): Observable<SalesInhouse[]> {
		return this.apiService.get(`/backend/sales-administration/sales-revision/sales-inhouse`);
	}

	getSalesAgents(): Observable<SalesAgent[]> {
		return this.apiService.get(`/backend/sales-administration/sales-revision/sales-agent`);
	}

	getPurposeOfPurchases(): Observable<OptionItem[]> {
		return this.apiService.get(`/backend/sales-administration/sales-revision/purpose-of-purchase`);
	}

	insertPurposeOfPurchase(purposeOfPurchaseName: string): Observable<OptionItem> {
		return this.apiService.post(`/backend/sales-administration/sales-revision/purpose-of-purchase`, {
			purposeOfPurchaseName
		});
	}

	getSourcesOfFund(): Observable<OptionItem[]> {
		return this.apiService.get(`/backend/sales-administration/sales-revision/source-of-fund`);
	}

	insertSourceOfFund(sourceOfFundName: string): Observable<OptionItem> {
		return this.apiService.post(`/backend/sales-administration/sales-revision/source-of-fund`, {
			sourceOfFundName
		});
	}

	getReferences(): Observable<OptionItem[]> {
		return this.apiService.get(`/backend/sales-administration/sales-revision/reference`);
	}

	insertReference(referenceName: string): Observable<OptionItem> {
		return this.apiService.post(`/backend/sales-administration/sales-revision/reference`, {
			referenceName
		});
	}

	updateSalesRevision(salesRevisionId: number, data) {
		return this.apiService.upload(`/backend/sales-administration/sales-revision/${salesRevisionId}`, data, true);
	}
}
