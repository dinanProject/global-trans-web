import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';

// export interface SalesInhouseType {
// 	salesInhouseTypeId: number;
// 	salesInhouseTypeName: string;
// }

export interface Team {
	teamId: number;
	teamName: string;
	// salesInhouseTypeId: number;
	supervisorId: number;
	supervisorName: string;
	smId: number;
	smName: string;
	gmId: number;
	gmName: string;
}

export interface Sales {
	employeeId: number;
	salesInhouseId: number;
	fullName: string;
}

@Injectable({
	providedIn: 'root'
})
export class DetailService {

	constructor(
		private apiService: ApiService
	) { }

	// getSalesInhouseTypes(): Observable<SalesInhouseType[]> {
	// 	return this.apiService.get(`/backend/sales-and-marketing/team/sales-type`);
	// }

	getTeam(teamId: number): Observable<Team> {
		return this.apiService.get(`/backend/sales-and-marketing/team/${teamId}`);
	}

	getTeamSales(teamId: number): Observable<Sales[]> {
		return this.apiService.get(`/backend/sales-and-marketing/team/${teamId}/sales`);
	}

	insertTeam(data: any) {
		return this.apiService.post(`/backend/sales-and-marketing/team`, data);
	}

	updateTeam(teamId: number, data: any) {
		return this.apiService.put(`/backend/sales-and-marketing/team/${teamId}`, data);
	}
}
