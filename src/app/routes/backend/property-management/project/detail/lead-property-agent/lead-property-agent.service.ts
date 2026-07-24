import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';

export interface LeadPropertyAgent {
	projectLeadPropertyAgentId: number;
	propertyAgentId: number;
	propertyAgentName: string;
	startDate: Date;
	endDate: Date;
}

@Injectable({
	providedIn: 'root'
})
export class LeadPropertyAgentService {

	constructor(
		private apiService: ApiService
	) { }

	getLeadPropertyAgent(projectId: number, projectLeadPropertyAgentId: number): Observable<LeadPropertyAgent> {
		return this.apiService.get(`/backend/property-management/project/${projectId}/lead-property-agent/${projectLeadPropertyAgentId}`)
	}

	insert(projectId: number, data: any) {
		return this.apiService.post(`/backend/property-management/project/${projectId}/lead-property-agent`, data)
	}

	update(projectId: number, projectLeadPropertyAgentId: number, data: any) {
		return this.apiService.put(`/backend/property-management/project/${projectId}/lead-property-agent/${projectLeadPropertyAgentId}`, data)
	}
}
