import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';

export interface PropertyAgent {
	propertyAgentId: number;
	propertyAgentCode: string;
	propertyAgentName: string;
	remark: string;
	salesAgentCount: number;
}

@Injectable({
	providedIn: 'root'
})
export class PropertyAgentService {

	constructor(
		private apiService: ApiService
	) { }

	getPropertyAgents(): Observable<PropertyAgent[]> {
		return this.apiService.get(`/backend/sales-and-property-agent/property-agent`)
	}
}
