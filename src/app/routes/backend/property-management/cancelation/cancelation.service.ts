import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

@Injectable({
	providedIn: 'root'
})
export class CancelationService {

	constructor(
		private apiService: ApiService
	) { }

	getCanceledUnits() {
		return this.apiService.get(`/backend/property-management/cancelation`);
	}
}
