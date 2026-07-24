import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';

export interface PaymentScheme {
	paymentSchemeId: number;
	paymentSchemeName: string;
}

export interface IntervalType {
	intervalTypeId: number;
	intervalTypeName: string;
}

export interface IntervalFrom {
	intervalFromId: number;
	intervalFromName: string;
}
@Injectable({
	providedIn: 'root'
})
export class PaymentPlanDetailService {

	constructor(
		private apiService: ApiService
	) { }

	getPaymentSchemes(projectId: number, paymentPlanId: number): Observable<PaymentScheme[]> {
		return this.apiService.get(`/backend/property-management/project/${projectId}/payment-plan/${paymentPlanId}/payment-scheme`);
	}

	getIntervalTypes(projectId: number, paymentPlanId: number): Observable<IntervalType[]> {
		return this.apiService.get(`/backend/property-management/project/${projectId}/payment-plan/${paymentPlanId}/interval-type`);
	}

	// getPaymentPlanDetail(projectId: number, paymentPlanId: number, paymentPlanDetailId: number): Observable<PaymenPlanDetail> {
	// 	return this.apiService.get(`/backend/property-management/project/${projectId}/payment-plan/${paymentPlanId}/${paymentPlanDetailId}`);
	// }
}
