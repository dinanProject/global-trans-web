import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';

export interface Team {
	teamId: number;
	teamName: string;
	supervisorName: string;
	smName: string;
	gmName: string;
	salesCount: number;
}

@Injectable({
	providedIn: 'root'
})
export class TeamService {

	constructor(
		private apiService: ApiService
	) { }

	getTeams(): Observable<Team[]> {
		return this.apiService.get(`/backend/sales-and-marketing/team`);
	}
}
