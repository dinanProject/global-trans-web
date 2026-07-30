import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from 'src/app/core/services/api.service';

export interface RoleMaster {
	uuid: string;
	code: string;
	name: string;
	description?: string | null;
	isSystem: boolean | number;
	isActive: boolean | number;
	companyUuid?: string | null;
	companyCode?: string | null;
	companyName?: string | null;
	permissionCount: number;
	userCount: number;
	createdAt?: string | null;
	updatedAt?: string | null;
}

export interface RoleCompanyOption {
	uuid: string;
	code: string;
	name: string;
}

export interface RoleOptions {
	companies: RoleCompanyOption[];
}

export interface CreateRolePayload {
	companyUuid: string | null;
	code: string;
	name: string;
	description?: string | null;
	isActive: number;
}

export interface UpdateRolePayload extends CreateRolePayload {}

@Injectable({ providedIn: 'root' })
export class RoleService {
	private readonly baseUrl = '/role';

	constructor(private readonly apiService: ApiService) {}

	getRoles(): Observable<RoleMaster[]> {
		return this.apiService.get(this.baseUrl);
	}

	getRole(roleUuid: string): Observable<RoleMaster> {
		return this.apiService.get(`${this.baseUrl}/${roleUuid}`);
	}

	getOptions(): Observable<RoleOptions> {
		return this.apiService.get(`${this.baseUrl}/options`);
	}

	createRole(payload: CreateRolePayload): Observable<RoleMaster> {
		return this.apiService.post(this.baseUrl, payload);
	}

	updateRole(
		roleUuid: string,
		payload: UpdateRolePayload,
	): Observable<RoleMaster> {
		return this.apiService.put(`${this.baseUrl}/${roleUuid}`, payload);
	}

	deleteRole(roleUuid: string): Observable<void> {
		return this.apiService.delete(`${this.baseUrl}/${roleUuid}`);
	}
}
