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
	sourceName: string;

	categoryName: string;
	categoryDate: string;
	color: string;
	statusName: string;
	statusDate: string;
	salesName: string;
}

export interface LeadHistory {
	historyId: number;
	historyDate: string;
	description: string;
}

@Injectable({
	providedIn: 'root'
})
export class DetailService {

	constructor(
		private apiService: ApiService
	) { }

	getLead(leadId: number): Observable<Lead> {
		return this.apiService.get(`/backend/sales-and-marketing/lead/${leadId}`);
	}

	getLeadHistory(leadId: number): Observable<LeadHistory[]> {
		return this.apiService.get(`/backend/sales-and-marketing/lead/${leadId}/history`);
	}
}
