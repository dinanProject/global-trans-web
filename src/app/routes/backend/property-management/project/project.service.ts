import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { Company } from './company';
import { Project } from './project.component';

@Injectable({
	providedIn: 'root'
})
export class ProjectService {

	constructor(
		private apiService: ApiService
	) { }

	getCompanies(): Observable<Array<Company>> {
		return this.apiService.get(`/backend/property-management/project/company`);
	}

	getProjects(): Observable<Array<Project>> {
		return this.apiService.get(`/backend/property-management/project`);
	}
}
