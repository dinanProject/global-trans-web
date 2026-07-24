import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

@Injectable({
	providedIn: 'root'
})
export class ProcessService {

	constructor(
		private apiService: ApiService
	) { }

	payment(debtorsAccountId: number, data) {
		return this.apiService.post(`/backend/finance/billing/${debtorsAccountId}`, data);
	}
}
