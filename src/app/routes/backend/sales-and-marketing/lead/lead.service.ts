import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';

export interface Lead {
	leadId: number;
	leadInitial: string;
	fullName: string;
	phoneNumber: string;
	locationName: string;
	registeredDate: string;
	categoryName: string;
	categoryDate: string;
	color: string;
	statusName: string;
	statusDate: string;
	icon: string;
	salesName?: string;
	salesInhouseTypeName?: string;
}

export interface LeadCategory {
	categoryId: number;
	categoryName: string;
}

export interface LeadStatus {
	statusId: number;
	statusName: string;
}

@Injectable({
	providedIn: 'root'
})
export class LeadService {

	constructor(
		private apiService: ApiService
	) { }

	getLeads(): Observable<Lead[]> {
		return this.apiService.get(`/backend/sales-and-marketing/lead`);
	}

	getLeadCategories(): Observable<LeadCategory[]> {
		return this.apiService.get(`/backend/sales-and-marketing/lead/category`);
	}

	getLeadStatuses(): Observable<LeadStatus[]> {
		return this.apiService.get(`/backend/sales-and-marketing/lead/status`);
	}
}
