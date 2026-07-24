import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';

export interface PropertyAgent {
	propertyAgentId: number;
	propertyAgentName: string;
}

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
	propertyAgentId: string;
}

@Injectable({
	providedIn: 'root'
})
export class DetailService {

	constructor(
		private apiService: ApiService
	) { }

	getPropertyAgents(): Observable<PropertyAgent[]> {
		return this.apiService.get(`/backend/sales-and-property-agent/sales-agent/property-agent`);
	}

	getSalesAgent(salesAgentId: number): Observable<SalesAgent> {
		return this.apiService.get(`/backend/sales-and-property-agent/sales-agent/${salesAgentId}`);
	}

	insertSalesAgent(data: any) {
		return this.apiService.post(`/backend/sales-and-property-agent/sales-agent`, data);
	}

	updateSalesAgent(salesAgentId: number, data: any) {
		return this.apiService.put(`/backend/sales-and-property-agent/sales-agent/${salesAgentId}`, data);
	}

	deleteSalesAgent(salesAgentId: number, deletedReason: string) {
		return this.apiService.delete(`/backend/sales-and-property-agent/sales-agent/${salesAgentId}`, {
			deletedReason
		});
	}

	getSalesAgentUnits(salesAgentId: number): Observable<SalesAgent> {
		return this.apiService.get(`/backend/sales-and-property-agent/sales-agent/${salesAgentId}/unit`);
	}
}
