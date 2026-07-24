import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';

export interface SalesAgent {
	salesAgentId: number;
	salesAgentCode: string;
	fullName: string;
	dob: Date;
	genderId: number;
	identityCode: string;
	handPhone: string;
	email: string;
	npwp: string;
	bankAccountCode: string;
	bankName: string;
}

@Injectable({
	providedIn: 'root'
})
export class SalesAgentService {

	constructor(
		private apiService: ApiService
	) { }

	getSalesAgent(propertyAgentId: number, salesAgentId: number): Observable<SalesAgent> {
		return this.apiService.get(`/backend/sales-and-property-agent/property-agent/${propertyAgentId}/sales-agent/${salesAgentId}`);
	}

	insertSalesAgent(propertyAgentId: number, data: any) {
		return this.apiService.post(`/backend/sales-and-property-agent/property-agent/${propertyAgentId}/sales-agent`, data);
	}

	updateSalesAgent(propertyAgentId: number, salesAgentId: number, data: any) {
		return this.apiService.put(`/backend/sales-and-property-agent/property-agent/${propertyAgentId}/sales-agent/${salesAgentId}`, data);
	}

	getSalesAgentUnits(propertyAgentId: number, salesAgentId: number): Observable<SalesAgent> {
		return this.apiService.get(`/backend/sales-and-property-agent/property-agent/${propertyAgentId}/sales-agent/${salesAgentId}/unit`);
	}
}
