import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { ApiService } from 'src/app/services/api.service';

@Injectable({
	providedIn: 'root'
})
export class MapService {

	constructor(
		private apiService: ApiService
	) { }

	getProject(projectId: number) {
		return this.apiService.get(`/backend/siteplan/project/${projectId}/map`);
	}
}
