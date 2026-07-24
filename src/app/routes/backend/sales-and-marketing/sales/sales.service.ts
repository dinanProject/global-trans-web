import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';

export interface Sales {
	salesInhouseId: number;
	salesInhouseTypeName: string;
	teamName: string;
	activeDate: string
	fullName: string;
	userImagePath: string;
}

@Injectable({
	providedIn: 'root'
})
export class SalesService {

	constructor(
		private apiService: ApiService
	) { }

	getSaleses(): Observable<Sales[]> {
		return this.apiService.get(`/backend/sales-and-marketing/sales`);
	}
}
