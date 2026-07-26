import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from 'src/app/core/services/api.service';

export interface Lookup {
	lookupId: number;
	lookupCode: string;
	lookupValue: string;
	lookupAlias?: string | null;
	lookupGroup: string;
	siteId?: number | null;
	isActive: boolean | number;
	createdAt?: string;
	updatedAt?: string;
}

export interface LookupQuery {
	lookupGroup?: string;
	lookupCode?: string;
	isActive?: boolean | number;
}

@Injectable({
	providedIn: 'root',
})
export class LookupService {
	constructor(private apiService: ApiService) {}

	getLookups(query?: LookupQuery): Observable<Lookup[]> {
		let params = new HttpParams();

		if (query?.lookupGroup) {
			params = params.set('lookupGroup', query.lookupGroup);
		}

		if (query?.lookupCode) {
			params = params.set('lookupCode', query.lookupCode);
		}

		if (query?.isActive !== undefined) {
			params = params.set('isActive', String(query.isActive));
		}

		return this.apiService.get('/lookup', params);
	}

	getLookupsByGroup(lookupGroup: string): Observable<Lookup[]> {
		const params = new HttpParams()
			.set('lookupGroup', lookupGroup)
			.set('isActive', '1');

		return this.apiService.get('/lookup', params);
	}

	getLookup(uuid: string): Observable<Lookup> {
		return this.apiService.get(`/lookup/${uuid}`);
	}
}
