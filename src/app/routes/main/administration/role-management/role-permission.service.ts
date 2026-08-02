import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from 'src/app/core/services/api.service';
import { PermissionMaster } from '../permission-management/permission.service';

export interface RolePermissionState {
	roleUuid: string;
	permissions: PermissionMaster[];
	selectedPermissionUuids: string[];
}

export interface UpdateRolePermissionsPayload {
	permissionUuids: string[];
}

@Injectable({ providedIn: 'root' })
export class RolePermissionService {
	private readonly baseUrl = '/role-permission';

	constructor(private readonly apiService: ApiService) {}

	getRolePermissions(roleUuid: string): Observable<RolePermissionState> {
		return this.apiService.get(`${this.baseUrl}/${roleUuid}`);
	}

	updateRolePermissions(
		roleUuid: string,
		payload: UpdateRolePermissionsPayload,
	): Observable<RolePermissionState> {
		return this.apiService.put(`${this.baseUrl}/${roleUuid}`, payload);
	}
}
