import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiService } from 'src/app/core/services/api.service';

export interface ReportCompanyOption {
	id: number;
	uuid: string;
	code: string;
	name: string;
}

export interface ReportDivisionOption {
	id: number;
	uuid: string;
	code: string;
	name: string;
	companyUuid: string;
}

export interface ReportCategoryOption {
	id: number;
	uuid: string;
	code: string;
	name: string;
}

export interface ReportStatusOption {
	code: string;
	name: string;
	sortOrder: number;
}

export interface ReportFiltersResponse {
	companies: ReportCompanyOption[];
	divisions: ReportDivisionOption[];
	categories: ReportCategoryOption[];
	statuses: ReportStatusOption[];
}

export interface ReportExportFilter {
	startDate?: string;
	endDate?: string;
	companyUuid?: string;
	divisionUuid?: string;
	status?: string;
	categoryUuid?: string;
}

@Injectable({ providedIn: 'root' })
export class ReportsService {
	private readonly baseUrl = '/equipment-request/report';

	constructor(private readonly apiService: ApiService) {}

	getFilters(): Observable<ReportFiltersResponse> {
		return this.apiService.get(`${this.baseUrl}/filters`);
	}

	exportExcel(filter: ReportExportFilter): Observable<Blob> {
		let params = new HttpParams();
		Object.entries(filter).forEach(([key, value]) => {
			if (value !== undefined && value !== null && value !== '') {
				params = params.set(key, String(value));
			}
		});
		return this.apiService.getBlob(`${this.baseUrl}/export`, params);
	}
}
