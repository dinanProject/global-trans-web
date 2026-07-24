import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

@Injectable({
	providedIn: 'root'
})
export class ProfileService {

	constructor(
		private apiService: ApiService
	) { }

	getUserData() {
		return this.apiService.get(`/backend/profile`);
	}

	changePassword(data) {
		return this.apiService.put(`/backend/change-password`, data);
	}

	uploadProfilePicture(data) {
		return this.apiService.upload(`/backend/profile-picture`, data);
	}
}
