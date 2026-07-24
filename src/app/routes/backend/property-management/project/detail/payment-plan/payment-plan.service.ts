import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';


export interface PaymentPlan {
	paymentPlanId: number;
	paymentMethodId: number;
	paymentMethodName: string;
	paymentPlanName: string;
	remark: string;
}

export interface PaymentMethod {
	paymentMethodId: number;
	paymentMethodName: string;
}

export interface PaymentPlanDetail {
	paymentPlanDetailId: number;
	paymentSchemeId: number;
	paymentSchemeName: string;
	priceAmount?: number;
	pricePercent?: number;
	sequence?: number;
	numberOfInstall?: number;
	interval?: number;
	intervalTypeId?: number;
	intervalTypeName?: string;
	intervalFromId?: number;
	deductFromId?: number;
	deductAmount?: number;
	deductPercent?: number;
	isAdded?: boolean;
	isEdited?: boolean;
	isDeleted?: boolean;
}

@Injectable({
	providedIn: 'root'
})
export class PaymentPlanService {

	constructor(
		private apiService: ApiService
	) { }

	getPaymentPlan(projectId: number, paymentPlanId: number): Observable<{
		paymentPlan: PaymentPlan,
		paymentPlanDetails: PaymentPlanDetail[]
	}> {
		return this.apiService.get(`/backend/property-management/project/${projectId}/payment-plan/${paymentPlanId}`);
	}

	getPaymentMethods(projectId): Observable<PaymentMethod[]> {
		return this.apiService.get(`/backend/property-management/project/${projectId}/payment-plan/payment-method`);
	}

	insert(projectId: number, data: any) {
		return this.apiService.post(`/backend/property-management/project/${projectId}/payment-plan`, data);
	}

	update(projectId: number, paymentPlanId: number, data: any) {
		return this.apiService.put(`/backend/property-management/project/${projectId}/payment-plan/${paymentPlanId}`, data);
	}
}
