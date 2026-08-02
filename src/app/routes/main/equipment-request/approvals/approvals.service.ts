import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiService } from 'src/app/core/services/api.service';
import {
	RequestActionPayload,
	RequestMaster,
} from '../request/request.service';

export interface ApprovalQueryParams {
	status?: string | null;
	search?: string | null;
	fromDate?: string | null;
	toDate?: string | null;
}

@Injectable({
	providedIn: 'root',
})
export class ApprovalService {
	private readonly baseUrl = '/equipment-request/approval';

	constructor(private readonly apiService: ApiService) {}

	getApprovals(params?: ApprovalQueryParams): Observable<RequestMaster[]> {
		return this.apiService.get(this.baseUrl, this.compactParams(params));
	}

	getApproval(uuid: string): Observable<RequestMaster> {
		return this.apiService.get(`${this.baseUrl}/${uuid}`);
	}

	executeAction(
		uuid: string,
		payload: RequestActionPayload,
	): Observable<RequestMaster> {
		return this.apiService.post(`${this.baseUrl}/${uuid}/action`, payload);
	}

	private compactParams(params?: ApprovalQueryParams): HttpParams {
		let httpParams = new HttpParams();

		if (!params) {
			return httpParams;
		}

		Object.entries(params).forEach(([key, value]) => {
			if (value !== null && value !== undefined && value !== '') {
				httpParams = httpParams.set(key, String(value));
			}
		});

		return httpParams;
	}
}
