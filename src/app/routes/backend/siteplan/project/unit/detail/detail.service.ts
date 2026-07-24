import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { ApiService } from 'src/app/services/api.service';

@Injectable({
	providedIn: 'root'
})
export class DetailService {

	constructor(
		private apiService: ApiService
	) { }

	getUnits(projectId: number, unitId: number) {
		return this.apiService.get(`/backend/siteplan/project/${projectId}/unit/${unitId}`);
	}

	updateUnit(projectId: number, unitId: number, data) {
		return this.apiService.put(`/backend/siteplan/project/${projectId}/unit/${unitId}`, data);
	}
}
