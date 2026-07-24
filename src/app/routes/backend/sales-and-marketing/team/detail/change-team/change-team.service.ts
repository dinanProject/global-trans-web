import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { Team } from '../../team.service';

@Injectable({
	providedIn: 'root'
})
export class ChangeTeamService {

	constructor(
		private apiService: ApiService
	) { }

	getTeams(): Observable<Team[]> {
		return this.apiService.get(`/backend/sales-and-marketing/team`);
	}

	changeTeam(teamId: number, salesInhouseId: number) {
		return this.apiService.put(`/backend/sales-and-marketing/team/${teamId}/change-team`, {
			salesInhouseId
		});
	}
}
