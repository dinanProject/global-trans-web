import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';

export interface SalesRevision {
	salesRevisionId: number;
	salesDate: string;
	fullName: string;
	paymentMethodName: string;
	projectName: string;
	unitId: string;
	unitName: string;
	revisionStatusName: string;
	revisionStatusDate: string;
	revisionStatusUserName: string;
	revisionReason: string;
}

@Injectable({
	providedIn: 'root'
})
export class SalesRevisionService {

	constructor(
		private apiService: ApiService
	) { }

	getSalesRevisions(): Observable<SalesRevision[]> {
		return this.apiService.get(`/backend/sales-administration/sales-revision`);
	}
}
