import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';

export interface Sales {
	personId: number;
	employeeId: number;
	salesInhouseId: number;
	fullName: string;
	formattedDob: string;
	formattedAge: string;
	genderName: string;
	handPhone: string;
	email: string;

	employeeCode: string;
	occupationName: string;
	departmentName: string;
	companyName: string;
	teamName: string;
	activeDate: string;
	inactiveDate: string;
	userImagePath: string;
}

export interface Lead {
	leadId: number;
	fullName: string;
	locationName: string;
	categoryName: string;
	color: string;
	statusName: string;
	statusDate: string;
	lastFollowUpDate: string;
	nextFollowUpDate: string;
}

@Injectable({
	providedIn: 'root'
})
export class DetailService {

	constructor(
		private apiService: ApiService
	) { }

	getSales(salesInhouseId: number): Observable<Sales> {
		return this.apiService.get(`/backend/sales-and-marketing/sales/${salesInhouseId}`)
	}

	getActiveLeads(salesInhouseId: number): Observable<Lead[]> {
		return this.apiService.get(`/backend/sales-and-marketing/sales/${salesInhouseId}/lead`);
	}

	getLeadsHistory(salesInhouseId: number): Observable<Lead[]> {
		return this.apiService.get(`/backend/sales-and-marketing/sales/${salesInhouseId}/lead/history`);
	}
}
