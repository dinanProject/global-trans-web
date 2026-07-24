import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

@Injectable({
	providedIn: 'root'
})
export class UserService {

	constructor(
		private apiService: ApiService
	) { }

	getUsers() {
		return this.apiService.get(`/backend/sys/user`);
	}

	resetPassword(userId: number) {
		return this.apiService.put(`/backend/sys/user/${userId}/reset-password`);
	}
}
