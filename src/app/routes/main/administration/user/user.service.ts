import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/core/services/api.service';

export interface UserRoleOption {
	uuid: string;
	code: string;
	name: string;
	description?: string | null;

	isSystem: boolean | number;
	isActive?: boolean | number;

	companyUuid: string | null;
	companyCode?: string | null;
	companyName?: string | null;
}
export interface UserCompanyOption {
	uuid: string;
	code: string;
	name: string;
}
export interface UserDivisionOption {
	uuid: string;
	code: string;
	name: string;
	companyUuid: string;
}
export interface UserOptions {
	companies: UserCompanyOption[];
	divisions: UserDivisionOption[];
	roles: UserRoleOption[];
}

export interface UserMaster {
	uuid: string;
	email: string;
	fullName: string;
	phone?: string | null;
	isActive: boolean | number;
	lastLoginAt?: string | null;
	companyUuid: string;
	companyCode: string;
	companyName: string;
	divisionUuid?: string | null;
	divisionCode?: string | null;
	divisionName?: string | null;
	roleCount?: number;
	roleNames?: string;
	roles?: UserRoleOption[];
}

export interface UserPayload {
	companyUuid: string;
	divisionUuid: string | null;
	email: string;
	fullName: string;
	phone: string | null;
	roleUuids: string[];
	isActive: boolean;
	password?: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
	private readonly baseUrl = '/user';
	constructor(private readonly apiService: ApiService) {}
	getUsers(): Observable<UserMaster[]> {
		return this.apiService.get(this.baseUrl);
	}
	getUser(uuid: string): Observable<UserMaster> {
		return this.apiService.get(`${this.baseUrl}/${uuid}`);
	}
	getOptions(): Observable<UserOptions> {
		return this.apiService.get(`${this.baseUrl}/options`);
	}
	createUser(payload: UserPayload): Observable<UserMaster> {
		return this.apiService.post(this.baseUrl, payload);
	}
	updateUser(uuid: string, payload: UserPayload): Observable<UserMaster> {
		return this.apiService.put(`${this.baseUrl}/${uuid}`, payload);
	}
	resetPassword(uuid: string, password: string): Observable<void> {
		return this.apiService.put(`${this.baseUrl}/${uuid}/reset-password`, {
			password,
		});
	}
	deactivateUser(uuid: string): Observable<void> {
		return this.apiService.delete(`${this.baseUrl}/${uuid}`);
	}
}
