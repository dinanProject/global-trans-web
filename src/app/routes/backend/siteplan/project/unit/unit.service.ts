import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

@Injectable({
	providedIn: 'root'
})
export class UnitService {

	constructor(
		private apiService: ApiService
	) { }

	getUnits(projectId) {
		return this.apiService.get(`/backend/siteplan/project/${projectId}/unit`);
	}

	deleteUnit(projectId, unitId) {
		return this.apiService.delete(`/backend/siteplan/project/${projectId}/unit/${unitId}`);
	}

}
