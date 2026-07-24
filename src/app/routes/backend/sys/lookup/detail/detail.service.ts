import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

@Injectable({
	providedIn: 'root'
})
export class DetailService {

	constructor(
		private apiService: ApiService
	) { }

	getLookup(data) {
		return this.apiService.get(`/backend/sys/lookup/${data.lookupId}/${data.lookupName}/${data.lookupGroup}`);
	}

	insertLookup(data) {
		return this.apiService.post(`/backend/sys/lookup`, data);
	}

	updateLookup(lookupId, lookupName, lookupGroup, data) {
		return this.apiService.put(`/backend/sys/lookup/${lookupId}/${lookupName}/${lookupGroup}`, data);
	}
}
