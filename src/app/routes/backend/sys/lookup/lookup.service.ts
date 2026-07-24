import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

@Injectable({
	providedIn: 'root'
})
export class LookupService {

	constructor(
		private apiService: ApiService
	) { }

	getLookups() {
		return this.apiService.get(`/backend/sys/lookup`);
	}

	deleteLookup(lookupId) {
		return this.apiService.delete(`/backend/sys/lookup/${lookupId}`);
	}
}
