import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';

export interface PropertyAgent {
	propertyAgentId: number;
	propertyAgentCode: string;
	propertyAgentName: string;
	remark: string;
	companyName: string;
	ownerName: string;
	area: string;
	address: string;
	phone: string;
	fax: string;
	email: string;
}

export interface SalesAgent {
	salesAgentId: number;
	salesAgentCode: string;
	fullName: string;
	handPhone: string;
	email: string;
}

export interface Employee {
	employeeId: number;
	fullName: string;
}

@Injectable({
	providedIn: 'root'
})
export class DetailService {

	constructor(
		private apiService: ApiService
	) { }

	getPropertyAgent(propertyAgentId: number): Observable<PropertyAgent> {
		return this.apiService.get(`/backend/sales-and-property-agent/property-agent/${propertyAgentId}`);
	}

	insertPropertyAgent(data: any) {
		return this.apiService.post(`/backend/sales-and-property-agent/property-agent`, data);
	}

	updatePropertyAgent(propertyAgentId: number, data: any) {
		return this.apiService.put(`/backend/sales-and-property-agent/property-agent/${propertyAgentId}`, data);
	}

	deletePropertyAgent(propertyAgentId: number, deleteReason: string) {
		return this.apiService.delete(`/backend/sales-and-property-agent/property-agent/${propertyAgentId}`, {
			deleteReason
		});
	}

	getSalesAgents(propertyAgentId: number): Observable<SalesAgent[]> {
		return this.apiService.get(`/backend/sales-and-property-agent/property-agent/${propertyAgentId}/sales-agent`);
	}

	deleteSalesAgent(propertyAgentId: number, salesAgentId: number, deletedReason: string) {
		return this.apiService.delete(`/backend/sales-and-property-agent/property-agent/${propertyAgentId}/sales-agent/${salesAgentId}`, {
			deletedReason
		});
	}

	getEmployees(): Observable<Employee[]> {
		return this.apiService.get(`/backend/sales-and-property-agent/property-agent/employee`);
	}
}
