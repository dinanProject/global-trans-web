import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from 'src/app/core/services/api.service';

export interface AccessRole {
	uuid: string;
	code: string;
	name: string;
	description?: string | null;
	isSystem: boolean | number;
	isActive: boolean | number;
	createdAt?: string | null;
	updatedAt?: string | null;
}

export interface UserCompany {
	uuid: string;
	code: string;
	name: string;
}

export interface UserDivision {
	uuid: string;
	code: string;
	name: string;
}

export interface AccessUser {
	uuid: string;
	fullName: string;
	email: string;
	phone?: string | null;
	isActive: boolean | number;
	createdAt?: string;

	company?: UserCompany | null;
	division?: UserDivision | null;

	roles: AccessRole[];
}

export interface AssignableRole extends AccessRole {
	assigned: boolean;
}

export interface UserRoleDetail {
	user: {
		uuid: string;
		fullName: string;
		email: string;
		phone?: string | null;
		isActive: boolean | number;
		company?: UserCompany | null;
		division?: UserDivision | null;
	};

	roles: AssignableRole[];
}

export interface RoleSummary extends AccessRole {
	permissionCount: number;
	userCount: number;
	createdAt?: string | null;
	updatedAt?: string | null;
}

export interface AccessPermission {
	uuid: string;
	code: string;
	scope?: string | null;
	label: string;
	module: string;
	action: string;
	description?: string | null;
	assigned: boolean;
}

export interface RolePermissionDetail {
	role: AccessRole;
	permissions: AccessPermission[];
}

@Injectable({
	providedIn: 'root',
})
export class AccessManagementService {
	constructor(private apiService: ApiService) {}

	getUsers(): Observable<AccessUser[]> {
		return this.apiService.get('/user-role');
	}

	getUserRoles(userUuid: string): Observable<UserRoleDetail> {
		return this.apiService.get(`/user-role/${userUuid}`);
	}

	updateUserRoles(
		userUuid: string,
		payload: {
			roleUuids: string[];
		},
	): Observable<UserRoleDetail> {
		return this.apiService.put(`/user-role/${userUuid}`, payload);
	}

	getRoles(): Observable<RoleSummary[]> {
		return this.apiService.get('/role-permission');
	}

	getRolePermissions(roleUuid: string): Observable<RolePermissionDetail> {
		return this.apiService.get(`/role-permission/${roleUuid}`);
	}

	updateRolePermissions(
		roleUuid: string,
		payload: {
			permissionUuids: string[];
		},
	): Observable<RolePermissionDetail> {
		return this.apiService.put(`/role-permission/${roleUuid}`, payload);
	}
}
