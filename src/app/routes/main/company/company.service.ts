import { Injectable } from '@angular/core';

import { ApiService } from 'src/app/core/services/api.service';
export interface Company {
	id: number;
	uuid: string;
	code: string;
	name: string;

	typeId?: number;
	typeCode?: string | null;
	typeName?: string | null;

	isActive: boolean | number;

	taxNumber?: string | null;
	email?: string | null;
	phone?: string | null;
	address?: string | null;
	city?: string | null;
	province?: string | null;
	postalCode?: string | null;

	createdAt?: string;
	updatedAt?: string;
}

export interface CompanyType {
	id: number;
	code: string;
	name: string;
}

export interface CompanyPayload {
	code: string;
	name: string;
	typeId: number;
	isActive: boolean;

	taxNumber: string | null;
	email: string | null;
	phone: string | null;
	address: string | null;
	city: string | null;
	province: string | null;
	postalCode: string | null;
}

export interface CompanyDialogData {
	mode: 'create' | 'edit';
	company?: Company;
	companyTypes: CompanyType[];
}

export interface CompanyDialogResult {
	action: 'save';
	payload: CompanyPayload;
}

@Injectable({
	providedIn: 'root',
})
export class CompanyService {
	constructor(private apiService: ApiService) {}

	getCompanies() {
		return this.apiService.get('/company');
	}

	getCompany(uuid: string) {
		return this.apiService.get(`/company/${uuid}`);
	}

	createCompany(payload: CompanyPayload) {
		return this.apiService.post('/company', payload);
	}

	updateCompany(uuid: string, payload: CompanyPayload) {
		return this.apiService.put(`/company/${uuid}`, payload);
	}

	deactivateCompany(uuid: string) {
		return this.apiService.delete(`/company/${uuid}`);
	}
}
