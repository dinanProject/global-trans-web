import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';

export interface CancelationType {
	cancelationTypeId: number;
	cancelationTypeName: string;
}

@Injectable({
	providedIn: 'root'
})
export class CancelationService {

	constructor(
		private apiService: ApiService
	) { }

	getCancelationTypes(): Observable<CancelationType[]> {
		return this.apiService.get(`/backend/sales-administration/sales-transaction/cancelation-type`);
	}
}
