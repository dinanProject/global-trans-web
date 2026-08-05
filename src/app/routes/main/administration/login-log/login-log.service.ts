import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiService } from 'src/app/core/services/api.service';

export interface LoginLog {
	id: number;
	uuid: string;

	userId: number | null;
	fullName: string | null;
	email: string | null;

	loginStatusId: number;
	statusCode: string;
	statusName: string;
	statusAlias: string | null;

	failureReason: string | null;
	failureMessage: string | null;

	ipAddress: string | null;
	userAgent: string | null;
	createdAt: string;
}

export interface LoginLogPagination {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
}

export interface LoginLogResponse {
	data: LoginLog[];
	pagination: LoginLogPagination;
}

export interface LoginLogQuery {
	page: number;
	limit: number;
	search?: string;
	status?: string;
	dateFrom?: string;
	dateTo?: string;
}

@Injectable({
	providedIn: 'root',
})
export class LoginLogService {
	constructor(private readonly apiService: ApiService) {}

	getLoginLogs(query: LoginLogQuery): Observable<LoginLogResponse> {
		let params = new HttpParams()
			.set('page', String(query.page))
			.set('limit', String(query.limit));

		if (query.search?.trim()) {
			params = params.set('search', query.search.trim());
		}

		if (query.status) {
			params = params.set('status', query.status);
		}

		if (query.dateFrom) {
			params = params.set('dateFrom', query.dateFrom);
		}

		if (query.dateTo) {
			params = params.set('dateTo', query.dateTo);
		}

		return this.apiService.get('/login-log', params);
	}
}
