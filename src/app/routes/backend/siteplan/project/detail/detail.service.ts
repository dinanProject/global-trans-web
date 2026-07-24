import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

@Injectable({
	providedIn: 'root'
})
export class DetailService {

	constructor(
		private apiService: ApiService
	) { }

	getProject(projectId) {
		return this.apiService.get(`/backend/siteplan/project/${projectId}`);
	}

	insertProject(data) {
		return this.apiService.post(`/backend/siteplan/project`, data);
	}

	updateProject(projectId, data) {
		return this.apiService.put(`/backend/siteplan/project/${projectId}`, data);
	}
}
