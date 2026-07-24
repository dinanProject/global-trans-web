import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';

export interface Client {
	clientName: string;
	clientSuffix: string;
	clientLogoPath: string;
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
export class RegistrationFormService {

	constructor(
		private apiService: ApiService
	) { }

	getClient(): Observable<Client> {
		return this.apiService.get('/sales-registration');
	}

	getGenders(): Observable<Gender[]> {
		return this.apiService.get(`/sales-registration/gender`);
	}

	getReligions(): Observable<Religion[]> {
		return this.apiService.get(`/sales-registration/religion`);
	}

	getIdentityCodeTypes(): Observable<IdentityCodeType[]> {
		return this.apiService.get(`/sales-registration/identity-code-type`);
	}

	getMaritalStatuses(): Observable<MaritalStatus[]> {
		return this.apiService.get(`/sales-registration/marital-status`);
	}

	getNationalities(): Observable<Nationality[]> {
		return this.apiService.get(`/sales-registration/nationality`);
	}

	insert(data: any) {
		return this.apiService.post(`/sales-registration`, data);
	}

	validateUserName(userName: string) {
		return this.apiService.get(`/sales-registration/validate-user-name?q=${userName}`);
	}
}
