import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

export interface UserRegistration {
	userRegistrationId: number;
	linkName: string;
	token: string;
	diff: number;
	expiredDate: Date;
	registrationStatusName: string;
}

@Injectable({
	providedIn: 'root'
})
export class UserRegistrationService {

	constructor(
		private apiService: ApiService
	) { }

	getUserRegistrations() {
		return this.apiService.get(`/backend/sys/user-registration`);
	}
}
