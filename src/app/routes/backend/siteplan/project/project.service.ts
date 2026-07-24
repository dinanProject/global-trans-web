import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from 'src/app/services/api.service';
import { Project } from './project';

@Injectable({
	providedIn: 'root'
})
export class ProjectService {

	constructor(
		private apiService: ApiService
	) { }

	getProjects(): Observable<Array<Project>> {
		return this.apiService.get(`/backend/siteplan/project`);
	}

	deleteProject(projectId) {
		return this.apiService.delete(`/backend/siteplan/project/${projectId}`);
	}
}
