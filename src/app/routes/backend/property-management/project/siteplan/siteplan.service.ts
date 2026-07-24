import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';

export interface Unit {
	unitId: number;
	unitName: string;
	unitNo: string;
	picX: number;
	picY: number;
	isOpen: boolean;
	isShowUnit: boolean;
	isInhabited: boolean;
	salesStatusName: string;
	formattedSalesStatusName: string;
	progressStatusName: string;
	formattedProgressStatusName: string;
	unitCategoryName: string;
	formattedUnitCategoryName: string;
	isLocked: boolean;
	formattedLockedDate: string;
	lockedUserName: string;
	lt?: number;
	lb?: number;
	unitTypeName: string;
	cashPrice: number;
}

export interface Project {
	projectId: number;
	projectName: string;
	formattedProjectName: string;
	siteplanPath: string;
	units: Unit[]
}

export interface Position {
	x: number;
	y: number;
}

export interface Size {
	width: number;
	height: number;
}

@Injectable({
	providedIn: 'root'
})
export class SiteplanService {

	constructor(
		private apiService: ApiService
	) { }

	getProject(projectId: number): Observable<Project> {
		return this.apiService.get(`/backend/property-management/project/${projectId}/siteplan`);
	}
}
