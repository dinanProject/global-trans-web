import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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

export interface PaymentPlanData {
	no?: number;
	paymentDate?: Date;
	paymentSchemeId?: number;
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
	paymentPlanDatas?: Array<PaymentPlanData>;
}

export interface PaymentPlan {
	paymentPlanId: number;
	paymentPlanName: string;
	paymentMethodId: number;
	price: number;
	paymentPlanDetails?: Array<PaymentPlanDetail>;
	isCustom?: boolean;
}

export interface Unit {
	unitId: number;
	unitName: string;
	projectName: string;
	isLocked: boolean;
	lockedUserId: number;
	lockedUserName: string;
	formattedLockedDate: string;
	salesStatusId: number;
}

export interface ReservationData {
	currentDate: Date;
	genders: Gender[];
	religions: Religion[];
	occupations: Occupation[];
	maritalStatuses: MaritalStatus[];
	purposeOfPurchases: PurposeOfPurchase[];
	sourceOfFundses: SourceOfFunds[];
	productReferences: ProductReference[];
	agentPropertyTypes: AgentPropertyType[];
	unit: Unit;
	paymentPlans: PaymentPlan[];
}


@Injectable({
	providedIn: 'root'
})
export class ReservationService {

	constructor(
		private apiService: ApiService
	) { }

	getReservationData(projectId: number, unitId: number): Observable<ReservationData> {
		// return this.apiService.get(`/product/project/unit/${unitId}/reservation`);
		return this.apiService.get(`/backend/property-management/project/${projectId}/siteplan/${unitId}/reservation`);
	}

	save(projectId: number, unitId: number, data: any) {
		// return this.apiService.upload(`/product/project/unit/${unitId}/reservation`, data);
		return this.apiService.upload(`/backend/property-management/project/${projectId}/siteplan/${unitId}/reservation`, data);
	}
}
