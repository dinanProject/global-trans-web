import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { Option } from 'src/app/interfaces/option';
import { OptionItem } from 'src/app/modules/option-dialog/option-dialog.component';

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
	// paymentPlanId: number;
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
}

export interface SalesInhouse {
	salesInhouseId: number;
	employeeCode: string;
	fullName: string;
	salesInhouseTypeName: string;
	supervisorName: string;
	smName: string;
}

export interface SalesAgent {
	salesAgentId: number;
	salesAgentCode: string;
	fullName: string;
	propertyAgentName: string;
}

export interface Reservation {
	reservationStatusName: string;
	reservationUserName: string;
	reservationStatusDate: string;
	icon: string;
	color: string;

	customerId: number;
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
	companyName: string;
	companyAddress: string;
	companyPhone: string;

	companyFax: string;
	reservationDate: Date;
	unitId: number;
	unitName: string;

	projectName: string;
	paymentPlanId: number;
	paymentPlanCode: string;
	unitPrice: number;
	discountAmount: number;
	discountPercent: number;

	salesPrice: number;
	salesPropertyTypeId: number;
	salesInhouseId: number;
	salesInhouseEmployeeCode: string;
	salesInhouseFullName: string;

	salesInhouseTypeName: string;
	supervisorName: string;
	smName: string;
	salesAgentId: number;
	salesAgentCode: string;

	salesAgentFullName: string;
	propertyAgentName: string;
	leadPropertyAgentId: number;
	leadPropertyAgentName: string;
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

	akadDate: Date;
	prePaymentDate: Date;
	prePaymentAmount: number;
	prePaymentTypeId: number;
	prePaymentNotes: string;
}

@Injectable({
	providedIn: 'root'
})
export class DetailService {

	constructor(
		private apiService: ApiService
	) { }

	getUnits(): Observable<Unit[]> {
		return this.apiService.get(`/backend/sales-administration/reservation/unit`);
	}

	getGenders(): Observable<Option[]> {
		return this.apiService.get(`/backend/sales-administration/reservation/gender`);
	}

	getReligions(): Observable<Option[]> {
		return this.apiService.get(`/backend/sales-administration/reservation/religion`);
	}

	getMaritalStatuses(): Observable<Option[]> {
		return this.apiService.get(`/backend/sales-administration/reservation/marital-status`);
	}

	getRegionals(): Observable<Regional[]> {
		return this.apiService.get(`/backend/sales-administration/reservation/regional`);
	}

	getProvinces(): Observable<Province[]> {
		return this.apiService.get(`/backend/sales-administration/reservation/province`);
	}

	getCities(): Observable<City[]> {
		return this.apiService.get(`/backend/sales-administration/reservation/city`);
	}

	getDistricts(): Observable<District[]> {
		return this.apiService.get(`/backend/sales-administration/reservation/district`);
	}

	getSubdistricts(): Observable<Subdistrict[]> {
		return this.apiService.get(`/backend/sales-administration/reservation/subdistrict`);
	}

	getOccupations(): Observable<OptionItem[]> {
		return this.apiService.get(`/backend/sales-administration/reservation/occupation`);
	}

	getSalesPropertyTypes(): Observable<OptionItem[]> {
		return this.apiService.get(`/backend/sales-administration/reservation/agent-property-type`);
	}

	getSalesInhouses(): Observable<SalesInhouse[]> {
		return this.apiService.get(`/backend/sales-administration/reservation/sales-inhouse`);
	}

	getSalesAgents(): Observable<SalesAgent[]> {
		return this.apiService.get(`/backend/sales-administration/reservation/sales-agent`);
	}

	getPurposeOfPurchases(): Observable<OptionItem[]> {
		return this.apiService.get(`/backend/sales-administration/reservation/purpose-of-purchase`);
	}

	insertPurposeOfPurchase(purposeOfPurchaseName: string): Observable<OptionItem> {
		return this.apiService.post(`/backend/sales-administration/reservation/purpose-of-purchase`, {
			purposeOfPurchaseName
		});
	}

	getSourcesOfFund(): Observable<OptionItem[]> {
		return this.apiService.get(`/backend/sales-administration/reservation/source-of-fund`);
	}

	insertSourceOfFund(sourceOfFundName: string): Observable<OptionItem> {
		return this.apiService.post(`/backend/sales-administration/reservation/source-of-fund`, {
			sourceOfFundName
		});
	}

	getReferences(): Observable<OptionItem[]> {
		return this.apiService.get(`/backend/sales-administration/reservation/reference`);
	}

	insertReference(referenceName: string): Observable<OptionItem> {
		return this.apiService.post(`/backend/sales-administration/reservation/reference`, {
			referenceName
		});
	}

	getPaymentTypes(): Observable<OptionItem[]> {
		return this.apiService.get(`/backend/sales-administration/reservation/payment-type`);
	}

	getReservation(reservationId: number): Observable<Reservation> {
		return this.apiService.get(`/backend/sales-administration/reservation/${reservationId}`);
	}

	getReservationPaymentPlan(reservationId: number): Observable<PaymentPlan> {
		return this.apiService.get(`/backend/sales-administration/reservation/${reservationId}/payment-plan`);
	}

	getReservationPaymentPlanDetails(reservationId: number): Observable<PaymentPlanDetail[]> {
		return this.apiService.get(`/backend/sales-administration/reservation/${reservationId}/payment-plan-detail`);
	}

	getUnit(unitId: number): Observable<Unit> {
		return this.apiService.get(`/backend/sales-administration/reservation/unit/${unitId}`)
	}

	getUnitLeadPropertyAgents(unitId: number): Observable<OptionItem[]> {
		return this.apiService.get(`/backend/sales-administration/reservation/unit/${unitId}/lead-property-agent`);
	}

	getUnitPaymentPlans(unitId: number): Observable<PaymentPlan[]> {
		return this.apiService.get(`/backend/sales-administration/reservation/unit/${unitId}/payment-plan`)
	}

	getUnitPaymentPlanDetails(unitId: number): Observable<PaymentPlanDetail[]> {
		return this.apiService.get(`/backend/sales-administration/reservation/unit/${unitId}/payment-plan-detail`)
	}

	insertReservation(data: any) {
		console.log('data', data);
		return this.apiService.upload(`/backend/sales-administration/reservation`, data);
	}

	updateReservation(reservationId: number, data: any) {
		return this.apiService.upload(`/backend/sales-administration/reservation/${reservationId}`, data, true);
	}

	requestApproval(reservationId: number) {
		return this.apiService.put(`/backend/sales-administration/reservation/${reservationId}/request-approval`);
	}

	approve(reservationId: number) {
		return this.apiService.put(`/backend/sales-administration/reservation/${reservationId}/approve`);
	}

	finalize(reservationId: number, data: any): Observable<{ salesId: number, sprFilePath: string }> {
		return this.apiService.put(`/backend/sales-administration/reservation/${reservationId}/finalize`, data);
	}

	previewSpr(reservationId: number) {
		return this.apiService.get(`/backend/sales-administration/reservation/${reservationId}/preview-spr`);
	}
}
