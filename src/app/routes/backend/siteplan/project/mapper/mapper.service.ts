import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from 'src/app/services/api.service';
import { Project } from '../project';

@Injectable({
	providedIn: 'root'
})
export class MapperService {

	constructor(
		private apiService: ApiService
	) { }

	getProject(projectId): Observable<Project> {
		return this.apiService.get(`/backend/siteplan/project/${projectId}/mapper`);
	}

	// getLots(entityCd, projectNo) {
	// 	return this.apiService.get(`/backend/siteplan/mapper/project/${entityCd}/${projectNo}/lot`);
	// }

	save(projectId, units) {
		return this.apiService.put(`/backend/siteplan/project/${projectId}/mapper`, units);
	}
}
