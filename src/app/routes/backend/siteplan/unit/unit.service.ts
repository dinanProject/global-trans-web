import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { ApiService } from 'src/app/services/api.service';

@Injectable({
	providedIn: 'root'
})
export class UnitService {

	constructor(
		private apiService: ApiService
	) { }

	getCompanies() {
		return this.apiService.get(`/backend/siteplan/unit/company`);
	}

	getProjects() {
		return this.apiService.get(`/backend/siteplan/unit/project`);
	}

	getUnits(projectId: number) {
		return this.apiService.get(`/backend/siteplan/unit/project/${projectId}/unit`);
	}
}
