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

	getUnit(projectId: number, unitId: number) {
		return this.apiService.get(`/backend/property-management/project/${projectId}/siteplan/${unitId}`);
	}
}
