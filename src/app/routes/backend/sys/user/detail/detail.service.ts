import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';


export interface User {
	userId: number;
	userName: string;
	defaultRoute: string;
	lockedDate: string;
	disabledDate: string;
	lastLoginDate: string;

	fullName: string;
	birthDate: string;
	age: string;
	birthPlace: string;

	companyName: string;
	departmentName: string;
	occupationName: string;
	employeeCode: string;
	joinDate: string;

	userImagePath: string;
}

export interface Role {
	userRoleId: number;
	isChecked: boolean;
	roleId: number;
	roleName: string;
	remark: string;
}

export interface Client {
	userClientId: number;
	clientId: number;
	clientName: string;
	clientLogoPath: string;
	isChecked: boolean;
	isIndeterminate: boolean;
	level: number;
	companies: Company[];
}

export interface Company {
	userCompanyId: number;
	companyId: number;
	companyName: string;
	parentId: number;
	sequence: number;
	isChecked: boolean;
	isIndeterminate: boolean;
	level: number;
	child: Company[];
}

@Injectable({
	providedIn: 'root'
})
export class DetailService {

	constructor(
		private apiService: ApiService
	) { }

	getUser(userId) {
		return this.apiService.get(`/backend/sys/user/${userId}`);
	}

	unlockUser(userId: number) {
		return this.apiService.put(`/backend/sys/user/${userId}/unlock`);
	}

	resetPassword(userId: number) {
		return this.apiService.put(`/backend/sys/user/${userId}/reset-password`);
	}

	enableUser(userId: number) {
		return this.apiService.put(`/backend/sys/user/${userId}/enable`);
	}

	disableUser(userId: number) {
		return this.apiService.put(`/backend/sys/user/${userId}/disable`);
	}

	update(userId: number, data: any) {
		return this.apiService.put(`/backend/sys/user/${userId}`, data);
	}
}
