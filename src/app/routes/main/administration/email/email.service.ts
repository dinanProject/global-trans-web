import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from 'src/app/core/services/api.service';

export interface EmailOutbox {
	uuid: string;
	moduleCode: string | null;
	referenceUuid: string | null;
	contextCode: string | null;
	templateCode: string | null;
	fromEmail: string | null;
	fromName: string | null;
	toEmail: string;
	ccEmail: string | null;
	bccEmail: string | null;
	subject: string;
	statusCode: string;
	priority: number;
	attemptCount: number;
	maxAttempt: number;
	scheduledAt: string | null;
	queuedAt: string | null;
	lastAttemptAt: string | null;
	sentAt: string | null;
	failedAt: string | null;
	lastErrorMessage: string | null;
	providerMessageId: string | null;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface EmailOutboxPagination {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
}

export interface EmailOutboxResponse {
	data: EmailOutbox[];
	pagination: EmailOutboxPagination;
}

export interface EmailOutboxQuery {
	page: number;
	limit: number;
	search?: string;
	status?: string;
	dateFrom?: string;
	dateTo?: string;
}

export interface EmailRetryPayload {
	toEmail: string;
	ccEmail: string | null;
	bccEmail: string | null;
}

export interface EmailRetryResult {
	uuid: string;
	statusCode: string;
}

export interface EmailOutboxDetail extends EmailOutbox {
	bodyHtml: string | null;
	bodyText: string | null;
}

@Injectable({
	providedIn: 'root',
})
export class EmailService {
	private readonly baseUrl = '/email';

	constructor(private readonly apiService: ApiService) {}

	getEmails(query: EmailOutboxQuery): Observable<EmailOutboxResponse> {
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

		return this.apiService.get(this.baseUrl, params);
	}

	getEmail(uuid: string): Observable<EmailOutboxDetail> {
		return this.apiService.get(`${this.baseUrl}/${uuid}`);
	}

	retryEmail(
		uuid: string,
		payload: EmailRetryPayload,
	): Observable<EmailRetryResult> {
		return this.apiService.post(`${this.baseUrl}/${uuid}/retry`, payload);
	}
}
