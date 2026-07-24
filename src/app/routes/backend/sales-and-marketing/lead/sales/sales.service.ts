import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';

export interface Sales {
	salesInhouseId: number;
	fullName: string;
	salesInhouseTypeName: string;
	isAssigning?: boolean;
}

@Injectable({
	providedIn: 'root'
})
export class SalesService {

	constructor(
		private apiService: ApiService
	) { }

	getSaleses(): Observable<Sales[]> {
		return this.apiService.get(`/backend/sales-and-marketing/lead/sales`);
	}

	assign(leadId: number, salesInhouseId: number) {
		return this.apiService.post(`/backend/sales-and-marketing/lead/${leadId}/assign/${salesInhouseId}`);
	}
}
