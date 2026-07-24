import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

@Injectable({
	providedIn: 'root'
})
export class DetailService {

	constructor(
		private apiService: ApiService
	) { }

	getCancelation(cancelationId: number) {
		return this.apiService.get(`/backend/property-management/cancelation/${cancelationId}`);
	}
}
