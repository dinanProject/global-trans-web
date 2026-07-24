import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';

export interface PropertyAgent {
	propertyAgentId: number;
	propertyAgentCode: string;
	propertyAgentName: string;
}

@Injectable({
	providedIn: 'root'
})
export class PropertyAgentService {

	constructor(
		private apiService: ApiService
	) { }

	getPropertyAgents(projectId: number): Observable<PropertyAgent[]> {
		return this.apiService.get(`/backend/property-management/project/${projectId}/property-agent`)
	}
}
