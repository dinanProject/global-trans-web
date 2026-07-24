import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from 'src/app/services/api.service';
// export interface PaymentScheme {
// 	paymentSchemeId: number;
// 	paymentSchemeName: string;
// }
@Injectable({
	providedIn: 'root'
})
export class CustomPlanService {

	constructor(
		private apiService: ApiService
	) { }

	getPaymentPlans(unitId: number) {
		return this.apiService.get(`/product/project/unit/${unitId}/reservation/payment-plan`);
	}

	// getPaymentSchemes(unitId: number): Observable<Array<PaymentScheme>> {
	// 	return this.apiService.get(`/product/project/unit/${unitId}/reservation/payment-plan`);
	// }
}
