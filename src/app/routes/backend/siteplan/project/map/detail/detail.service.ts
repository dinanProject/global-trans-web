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

	getUnit(projectId: number, unitId: number) {
		return this.apiService.get(`/backend/siteplan/project/${projectId}/map/${unitId}`);
	}

	save(projectId: number, unitId: number, data: any) {
		return this.apiService.put(`/backend/siteplan/project/${projectId}/map/${unitId}`, data);
	}
}
