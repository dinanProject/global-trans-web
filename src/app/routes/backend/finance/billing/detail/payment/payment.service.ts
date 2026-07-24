import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

@Injectable({
	providedIn: 'root'
})
export class PaymentService {

	constructor(
		private apiService: ApiService
	) { }

	payment(billingId: number, data) {
		return this.apiService.post(`/backend/finance/billing/${billingId}`, data);
	}
}
