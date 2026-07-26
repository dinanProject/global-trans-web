import { Injectable } from '@angular/core';

import { ApiService } from '../../../core/services/api.service';
import { Company } from '../company/company.service';

export interface Division {
	id: number;
	uuid: string;
	companyId: number;
	companyUuid: string;
	companyCode: string;
	companyName: string;
	code: string;
	name: string;
	description: string | null;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface DivisionPayload {
	companyUuid: string;
	code: string;
	name: string;
	description: string | null;
	isActive: boolean;
}

export interface DivisionDialogData {
	mode: 'create' | 'edit';
	division?: Division;
	companies: Company[];
}

export interface DivisionDialogResult {
	action: 'save';
	payload: DivisionPayload;
}

@Injectable()
export class DivisionService {
	constructor(private apiService: ApiService) {}

	getDivisions() {
		return this.apiService.get('/division');
	}

	getDivision(uuid: string) {
		return this.apiService.get(`/division/${uuid}`);
	}

	createDivision(payload: DivisionPayload) {
		return this.apiService.post('/division', payload);
	}

	updateDivision(uuid: string, payload: DivisionPayload) {
		return this.apiService.put(`/division/${uuid}`, payload);
	}

	deactivateDivision(uuid: string) {
		return this.apiService.delete(`/division/${uuid}`);
	}
}
