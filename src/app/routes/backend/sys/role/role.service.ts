import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

@Injectable({
	providedIn: 'root'
})
export class RoleService {

	constructor(
		private apiService: ApiService
	) { }

	getRoles() {
		return this.apiService.get(`/backend/sys/role`);
	}

	deleteRole(roleId) {
		return this.apiService.delete(`/backend/sys/role/${roleId}`);
	}
}
