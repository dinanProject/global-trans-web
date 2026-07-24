import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';

export interface SalesRegistration {
	registrationId: number;
	salesName: string;
	salesInhouseTypeName: string;
	teamName: string;
	token: string;
	diff: number;
	expiredDate: Date;
	registrationStatusName: string;
}

export interface SalesInhouseType {
	salesInhouseTypeId: number;
	salesInhouseTypeName: string;
}

export interface Team {
	teamId: number;
	teamName: string;
}

@Injectable({
	providedIn: 'root'
})
export class LinkService {

	constructor(
		private apiService: ApiService
	) { }

	getRegistration(registrationId: number): Observable<SalesRegistration> {
		return this.apiService.get(`/backend/sales-and-marketing/sales-registration/${registrationId}`);
	}

	getSalesInhouseTypes(): Observable<SalesInhouseType[]> {
		return this.apiService.get(`/backend/sales-and-marketing/sales-registration/sales-type`);
	}

	getTeams(): Observable<Team[]> {
		return this.apiService.get(`/backend/sales-and-marketing/sales-registration/team`);
	}

	createLink(data: any) {
		return this.apiService.post(`/backend/sales-and-marketing/sales-registration`, data)
	}
}
