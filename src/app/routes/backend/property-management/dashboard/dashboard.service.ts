import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

@Injectable({
	providedIn: 'root'
})
export class DashboardService {

	constructor(
		private apiService: ApiService
	) { }

	getSummary() {
		return this.apiService.get(`/backend/property-management/dashboard/summary`);
	}
}
