import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from 'src/app/core/services/api.service';

export interface PermissionMaster {
	uuid: string;
	code: string;
	label: string;
	module: string;
	action?: string | null;
	scope?: string | null;
	description?: string | null;
	isSystem?: boolean | number;
	isActive: boolean | number;
	roleCount?: number;
	createdAt?: string | null;
	updatedAt?: string | null;
}

export interface CreatePermissionPayload {
	code: string;
	label: string;
	module: string;
	action?: string | null;
	scope?: string | null;
	description?: string | null;
	isActive: boolean;
}

export interface UpdatePermissionPayload extends CreatePermissionPayload {}

@Injectable({ providedIn: 'root' })
export class PermissionService {
	private readonly baseUrl = '/permission';

	constructor(private readonly apiService: ApiService) {}

	getPermissions(): Observable<PermissionMaster[]> {
		return this.apiService.get(this.baseUrl);
	}

	getPermission(permissionUuid: string): Observable<PermissionMaster> {
		return this.apiService.get(`${this.baseUrl}/${permissionUuid}`);
	}

	createPermission(
		payload: CreatePermissionPayload,
	): Observable<PermissionMaster> {
		return this.apiService.post(this.baseUrl, payload);
	}

	updatePermission(
		permissionUuid: string,
		payload: UpdatePermissionPayload,
	): Observable<PermissionMaster> {
		return this.apiService.put(
			`${this.baseUrl}/${permissionUuid}`,
			payload,
		);
	}

	deletePermission(permissionUuid: string): Observable<void> {
		return this.apiService.delete(`${this.baseUrl}/${permissionUuid}`);
	}
}
