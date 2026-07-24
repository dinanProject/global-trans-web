import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

export interface SalesRegistration {
	registrationId: number;
	salesName: string;
	salesInhouseTypeName: string;
	teamName: string;
	token: string;
	diff: number;
	expiredDate: Date;
	registrationStatusName: string;
}

@Injectable({
	providedIn: 'root'
})
export class SalesRegistrationService {

	constructor(
		private apiService: ApiService
	) { }

	getUserRegistrations() {
		return this.apiService.get(`/backend/sales-and-marketing/sales-registration`);
	}
}
