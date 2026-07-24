import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

@Injectable({
	providedIn: 'root'
})
export class DetailService {

	constructor(
		private apiService: ApiService
	) { }

	getRole(roleId?: number) {
		roleId = roleId || 0;
		return this.apiService.get(`/backend/sys/role/${roleId}`);
	}

	// insert(roleName: string, remark: string, checkedMenuIds: number[]) {
	// 	return this.apiService.post(`/backend/sys/role`, {
	// 		roleName,
	// 		remark,
	// 		checkedMenuIds
	// 	});
	// }

	insert(data: any) {
		return this.apiService.post(`/backend/sys/role`, data);
	}

	// update(roleId, roleName: string, remark: string, checkedMenuIds: number[]) {
	// 	return this.apiService.put(`/backend/sys/role/${roleId}`, {
	// 		roleName,
	// 		remark,
	// 		checkedMenuIds
	// 	});
	// }

	update(roleId, data) {
		return this.apiService.put(`/backend/sys/role/${roleId}`, data);
	}
}
