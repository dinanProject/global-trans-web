import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from 'src/app/services/api.service';
import { PaymentScheme } from './custom-plan.component';

@Injectable({
	providedIn: 'root'
})
export class CustomPlanService {

	constructor(
		private apiService: ApiService
	) { }

	getPaymentSchemes(unitId: number): Observable<Array<PaymentScheme>> {
		return this.apiService.get(`/product/project/unit/${unitId}/reservation/payment-plan`);
	}
}
