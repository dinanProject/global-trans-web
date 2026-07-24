import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';

export interface SalesAgent {
	salesAgentId: number;
	salesAgentCode: string;
	fullName: string;
	propertyAgentName: string;
	handPhone: string;
}

@Injectable({
	providedIn: 'root'
})
export class SalesAgentService {

	constructor(
		private apiService: ApiService
	) { }

	getSalesAgents(): Observable<SalesAgent[]> {
		return this.apiService.get(`/backend/sales-and-property-agent/sales-agent`)
	}
}
