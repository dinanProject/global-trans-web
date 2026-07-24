import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { Unit } from './siteplan-mapper.component';

@Injectable({
	providedIn: 'root'
})
export class SiteplanMapperService {

	constructor(
		private apiService: ApiService
	) { }

	getProject(projectId: number) {
		return this.apiService.get(`/backend/property-management/project/siteplan-mapper/${projectId}`);
	}

	save(projectId: number, data: any) {
		return this.apiService.put(`/backend/property-management/project/siteplan-mapper/${projectId}`, data);
	}
}
