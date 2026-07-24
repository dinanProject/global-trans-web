import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';

export interface Employee {
	personId: number;
	fullName: string;
	genderId: number;
	religionId: number;
	dob: Date;
	identityCode: string;
	identityCodeTypeId: number;
	identityImagePath: string;
	maritalStatusId: number;
	nationalityId: number;
	homePhone: string;
	handPhone: string;
	identityAddress: string;
	mailingAddress: string;
	email: string;
	employeeCode: string;
	occupationId: number;
	occupationName: string;
	departmentName: string;
	companyName: string;
	supervisorId: number;
	joinDate: Date;
	resignDate: Date;
}

export interface Gender {
	genderId: number;
	genderName: string;
}

export interface Religion {
	religionId: number;
	religionName: string;
}

export interface IdentityCodeType {
	identityCodeTypeId: number;
	identityCodeTypeName: string;
}

export interface MaritalStatus {
	maritalStatusId: number;
	maritalStatusName: string;
}

export interface Nationality {
	nationalityId: number;
	nationalityName: string;
}

@Injectable({
	providedIn: 'root'
})
export class DetailService {

	constructor(
		private apiService: ApiService
	) { }

	getEmployee(employeeId: number): Observable<Employee> {
		return this.apiService.get(`/backend/hr/employee/${employeeId}`);
	}

	getGenders(): Observable<Gender[]> {
		return this.apiService.get(`/backend/hr/employee/gender`);
	}

	getReligions(): Observable<Religion[]> {
		return this.apiService.get(`/backend/hr/employee/religion`);
	}

	getIdentityCodeTypes(): Observable<IdentityCodeType[]> {
		return this.apiService.get(`/backend/hr/employee/identity-code-type`);
	}

	getMaritalStatuses(): Observable<MaritalStatus[]> {
		return this.apiService.get(`/backend/hr/employee/marital-status`);
	}

	getNationalities(): Observable<Nationality[]> {
		return this.apiService.get(`/backend/hr/employee/nationality`);
	}
}
