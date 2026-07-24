import { Injectable } from '@angular/core';
import { NumberValueAccessor } from '@angular/forms';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';

export interface Gender {
	genderId: number;
	genderName: string;
}

export interface Religion {
	religionId: number;
	religionName: string;
}

export interface MaritalStatus {
	maritalStatusId: number;
	maritalStatusName: string;
}

export interface Occupation {
	occupationId: number;
	occupationName: string;
}

export interface PurposeOfPurchase {
	purposeOfPurchaseId: number;
	purposeOfPurchaseName: string;
}

export interface SourceOfFunds {
	sourceOfFundsId: number;
	sourceOfFundsName: string;
}

export interface ProductReference {
	productReferenceId: number;
	productReferenceName: string;
}

export interface AgentPropertyType {
	agentPropertyTypeId: number;
	agentPropertyTypeName: string;
}

export interface Reservation {
	reservationId: number;
	reservationPaymentPlanId: number;
	reservationStatusId: number;
	reservationStatusName: string;

	fullName: string;
	genderId: number;
	dob: Date;
	pob: string;
	religionId: number;

	maritalStatusId: number;
	email: string;
	identityCode: string;
	npwp: string;

	identityAddress: string;
	mailingAddress: string;
	homePhone: string;
	handPhone: string;
	// occupation: string;
	occupationId: string;

	companyName: string;
	companyAddress: string;
	companyPhone: number;
	companyFax: string;

	purposeOfPurchaseId: number;
	purposeOfPurchaseRemark: string;
	sourceOfFundsId: number;
	sourceOfFundsRemark: string;

	paymentPlanId: number;
	paymentMethodId: number;
	isCustomPaymentPlan: boolean;
	unitPrice: number;
	discountAmount: number;
	discountPercent: number;
	salesPrice: number;
	promo: string;
	remark: string;

	productReferenceId: number;
	productReferenceRemark: string;

	agentPropertyTypeId: number;
	salesName: string;
	salesSupervisorName: string;
	salesManagerName: string;
	agentPropertyName: string;
	agentPropertyOfficePhone: string;
	agentPropertyLeadName: string;
	agentPropertySalesPhone: string;

	proofOfTransferImagePath: string;
	// TODO: delete ktpImagePath
	ktpImagePath: string;
	identityImagePath: string;
	npwpImagePath: string;

	unitId: number;
	unitName: string;
	projectName: string;
	unitCategoryName: string;
	unitTypeName: string;
	lt: number;
	lb: number;
	floor: number;
	bedRoom: number;
	carPort: number;
	progressStatusName: string;
	cashPrice: number;
	isShowUnit: boolean;

	identityProvinceId: number;
	identityCityId: number;
	identityDistrictId: number;
	identitySubdistrictId: number;

	mailingProvinceId: number;
	mailingCityId: number;
	mailingDistrictId: number;
	mailingSubdistrictId: number;
}

export interface ReservationPaymentPlan {
	reservationPaymentPlanId: number;
	paymentMethodName: string;
	paymentPlanStatusId: number;
	paymentPlanStatusName: string;
	formattedPaymentPlanStatusDate: string;
	paymentPlanStatusUserName: string;
	unitPrice: number;
}

export interface PaymentPlan {
	paymentPlanId: number;
	paymentPlanName: string;
	paymentMethodId: number;
	unitPrice: number;
	paymentPlanDetails?: PaymentPlanDetail[];
	isCustom?: boolean;
}

export interface PaymentPlanData {
	no?: number;
	paymentDate?: Date;
	paymentSchemeId: number;
	paymentSchemeName: string;
	priceAmount?: number;
	pricePercent?: number;
}

export interface PaymentPlanDetail {
	deductAmount: number;
	deductFromId: number;
	deductFromName: string;
	interval: number;
	intervalFromId: number;
	intervalTypeId: number;
	intervalTypeName: string;
	numberOfInstall: number;
	paymentPlanDetailId: number;
	paymentSchemeId: number;
	paymentSchemeName: string;
	priceAmount: number;
	pricePercent: number;
	paymentPlanDatas?: PaymentPlanData[];
}

export interface Province {
	provinceId: number;
	provinceName: string;
}

export interface City {
	cityId: number;
	cityName: string;
}

export interface District {
	districtId: number;
	districtName: string;
}

export interface Subdistrict {
	subdistrictId: number;
	subdistrictName: string;
}

@Injectable({
	providedIn: 'root'
})
export class DetailService {

	constructor(
		private apiService: ApiService
	) { }

	getGenders(): Observable<Gender[]> {
		return this.apiService.get(`/backend/property-management/reservation/gender`);
	}

	getReligions(): Observable<Religion[]> {
		return this.apiService.get(`/backend/property-management/reservation/religion`);
	}

	getOccupations(): Observable<Occupation[]> {
		return this.apiService.get(`/backend/property-management/reservation/occupation`);
	}

	getMaritalStatuses(): Observable<MaritalStatus[]> {
		return this.apiService.get(`/backend/property-management/reservation/marital-status`);
	}

	getPurposeOfPurchases(): Observable<PurposeOfPurchase[]> {
		return this.apiService.get(`/backend/property-management/reservation/purpose-of-purchase`);
	}

	getSourceOfFundses(): Observable<SourceOfFunds[]> {
		return this.apiService.get(`/backend/property-management/reservation/source-of-funds`);
	}

	getProductReferences(): Observable<ProductReference[]> {
		return this.apiService.get(`/backend/property-management/reservation/product-reference`);
	}

	getAgentPropertyTypes(): Observable<AgentPropertyType[]> {
		return this.apiService.get(`/backend/property-management/reservation/agent-property-type`);
	}

	getCurrentDate(): Observable<Date> {
		return this.apiService.get(`/backend/property-management/reservation/current-date`);
	}

	getReservation(reservationId: number): Observable<Reservation> {
		return this.apiService.get(`/backend/property-management/reservation/${reservationId}`);
	}

	getPaymentPlans(reservationId: number) {
		return this.apiService.get(`/backend/property-management/reservation/${reservationId}/payment-plan`);
	}

	getReservationPaymentPlan(reservationId: number, reservationPaymentPlanId: number): Observable<PaymentPlan> {
		return this.apiService.get(`/backend/property-management/reservation/${reservationId}/payment-plan/${reservationPaymentPlanId}`);
	}

	getProvinces(): Observable<Province[]> {
		return this.apiService.get(`/backend/property-management/reservation/province`);
	}

	getCities(provinceId: number): Observable<City[]> {
		return this.apiService.get(`/backend/property-management/reservation/province/${provinceId}/city`);
	}

	getDistricts(provinceId: number, cityId: number): Observable<District[]> {
		return this.apiService.get(`/backend/property-management/reservation/province/${provinceId}/city/${cityId}/district`);
	}

	getSubdistricts(provinceId: number, cityId: number, districtId: number): Observable<Subdistrict[]> {
		return this.apiService.get(`/backend/property-management/reservation/province/${provinceId}/city/${cityId}/district/${districtId}/subdistrict`);
	}

	update(reservationId: number, data) {
		return this.apiService.upload(`/backend/property-management/reservation/${reservationId}`, data, true);
	}

	finalize(reservationId: number) {
		return this.apiService.post(`/backend/property-management/reservation/${reservationId}/finalize`);
	}

	cancelation(reservationId: number) {
		return this.apiService.delete(`/backend/property-management/reservation/${reservationId}`);
	}

	requestApproval(reservationId: number) {
		return this.apiService.post(`/backend/property-management/reservation/${reservationId}/request-approval`);
	}

	printSpr(reservationId: number) {
		return this.apiService.post(`/backend/property-management/reservation/${reservationId}/print-spr`);
	}

	previewSpr(reservationId: number) {
		return this.apiService.post(`/backend/property-management/reservation/${reservationId}/preview-spr`);
	}

	approve(reservationId: number, reservationPaymentPlanId: number) {
		return this.apiService.post(`/backend/property-management/reservation/${reservationId}/approve`);
	}
}
