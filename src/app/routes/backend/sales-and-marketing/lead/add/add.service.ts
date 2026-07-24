import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';

export interface Source {
	sourceId: number;
	sourceName: string;
}

@Injectable({
	providedIn: 'root'
})
export class AddService {

	constructor(
		private apiService: ApiService
	) { }

	getSources(): Observable<Source[]> {
		return this.apiService.get(`/backend/sales-and-marketing/lead/source`);
	}

	insert(data: any) {
		return this.apiService.post(`/backend/sales-and-marketing/lead`, data);
	}
}
