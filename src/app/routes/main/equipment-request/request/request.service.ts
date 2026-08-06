import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from 'src/app/core/services/api.service';

export interface RequestDetail {
	uuid?: string | null;
	equipmentCategoryId: number;
	equipmentCategoryName?: string | null;
	equipmentCategoryCode?: string | null;
	categoryName?: string | null;
	equipmentUnitId?: number | null;
	requiredCapacityValue: number;
	requiredCapacityUnit: string;
	rate?: number | null;
	remarks?: string | null;
}

export interface RequestApproval {
	uuid: string;
	approvalLevel: number;
	companyName?: string | null;
	roleName?: string | null;
	userName?: string | null;
	status: string;
	remarks?: string | null;
	actionDate?: string | null;
	createdAt?: string | null;
}

export interface RequestHistory {
	uuid: string;
	activity: string;
	description: string;
	userName?: string | null;
	createdAt: string;
}

export interface RequestAction {
	uuid: string;
	fromStatusCode: string;
	toStatusCode: string;
	toStatusName?: string | null;
	actionCode: string;
	actionName: string;
	actorStage?: string | null;
	permissionCode?: string | null;
	requiresRemarks: boolean;
	lockRequest: boolean;
	confirmationTitle?: string | null;
	confirmationMessage?: string | null;
	sortOrder: number;
}

export interface RequestMaster {
	uuid: string;
	requestNo: string;
	companyUuid?: string | null;
	companyCode?: string | null;
	companyName?: string | null;
	divisionUuid?: string | null;
	divisionCode?: string | null;
	divisionName?: string | null;
	requestByUuid?: string | null;
	requestByName?: string | null;
	requestDate: string;
	startDate: string;
	endDate: string;
	purpose?: string | null;
	notes?: string | null;
	status: string;
	statusName?: string | null;
	statusStage?: string | null;
	statusSortOrder?: number | null;
	statusAllowEdit: boolean;
	statusIsTerminal: boolean;
	currentApprovalLevel: number;
	approvalLocked: boolean;
	isActive: boolean;
	createdAt?: string | null;
	updatedAt?: string | null;
	details?: RequestDetail[];
	approvals?: RequestApproval[];
	histories?: RequestHistory[];
	availableActions?: RequestAction[];
}

export interface RequestFilter {
	search?: string;
	status?: string;
	companyId?: number;
	divisionUuid?: string;
	startDate?: string;
	endDate?: string;
	isActive?: boolean;
}

export interface RequestPayload {
	companyUuid: string | null;
	divisionUuid: string | null;
	startDate: string;
	endDate: string;
	purpose: string | null;
	notes: string | null;
	details: RequestDetail[];
}

export interface RequestActionPayload {
	actionCode: string;
	remarks?: string | null;

	startDate?: string | null;
	endDate?: string | null;
}

export interface RequestCompanyOption {
	id: number;
	uuid: string;
	code: string;
	name: string;
}

export interface RequestDivisionOption {
	uuid: string;
	code: string;
	name: string;
	companyId?: number | null;
}

export interface CategoryOption {
	id: number;
	uuid?: string | null;
	code?: string | null;
	name: string;
	icon?: string | null;
}

export interface UnitOption {
	id: number;
	uuid: string;
	categoryId: number;
	unitCode: string;
	unitName: string;
	capacityValue?: number | null;
	capacityUnit?: string | null;
	assetNumber?: string | null;
	modelNumber?: string | null;
	plateNumber?: string | null;
	remarks?: string | null;
}

export interface RequestFormDialogData {
	mode: 'create' | 'edit';
	request?: RequestMaster;
	company: RequestCompanyOption | null;
	divisions: RequestDivisionOption[];
	categories: CategoryOption[];
	units: UnitOption[];
}

export interface RequestStatusOption {
	id: number;
	uuid: string;
	code: string;
	name: string;
	description?: string | null;
	stage: string;
	sortOrder: number;
	allowEdit: boolean;
	isTerminal: boolean;
	isActive: number;
}

export interface CapacityUnitOption {
	lookupId: number;
	lookupCode: string;
	lookupValue: string;
	lookupAlias?: string | null;
	lookupGroup: string;
	isActive: number;
}

@Injectable({ providedIn: 'root' })
export class RequestService {
	private readonly baseUrl = '/equipment-request/request';

	constructor(private readonly apiService: ApiService) {}

	getRequests(filter: RequestFilter = {}): Observable<RequestMaster[]> {
		return this.apiService.get(this.baseUrl, this.compactParams(filter));
	}

	getRequest(requestUuid: string): Observable<RequestMaster> {
		return this.apiService.get(`${this.baseUrl}/${requestUuid}`);
	}

	getRequestStatuses(): Observable<RequestStatusOption[]> {
		return this.apiService.get(`${this.baseUrl}/request-statuses`);
	}

	createRequest(payload: RequestPayload): Observable<RequestMaster> {
		return this.apiService.post(this.baseUrl, payload);
	}

	updateRequest(
		requestUuid: string,
		payload: RequestPayload,
	): Observable<RequestMaster> {
		return this.apiService.put(`${this.baseUrl}/${requestUuid}`, payload);
	}

	deleteRequest(requestUuid: string): Observable<{ uuid: string }> {
		return this.apiService.delete(`${this.baseUrl}/${requestUuid}`);
	}

	executeAction(
		requestUuid: string,
		payload: RequestActionPayload,
	): Observable<RequestMaster> {
		return this.apiService.post(
			`${this.baseUrl}/${requestUuid}/action`,
			payload,
		);
	}

	/* Existing master routes in the project. Mapping is deliberately isolated here. */
	getCompanies(): Observable<RequestCompanyOption[]> {
		return this.apiService.get(
			'/company',
			this.compactParams({ isActive: 1 }),
		);
	}

	getDivisions(companyId?: number): Observable<RequestDivisionOption[]> {
		return this.apiService.get(
			'/division',
			this.compactParams({ companyId, isActive: 1 }),
		);
	}

	getCategories(): Observable<CategoryOption[]> {
		return this.apiService.get(
			'/equipment-category',
			this.compactParams({ isActive: 1 }),
		);
	}

	getUnits(): Observable<UnitOption[]> {
		const params = new HttpParams().set('isActive', '1');
		return this.apiService.get('/equipment-unit', params);
	}

	getCapacityUnits(): Observable<CapacityUnitOption[]> {
		return this.apiService.get(
			'/lookup',
			this.compactParams({
				lookupGroup: 'equipment_capacity_unit',
				isActive: 1,
			}),
		);
	}

	private compactParams<T extends object>(source: T): HttpParams {
		let params = new HttpParams();

		Object.entries(source).forEach(([key, value]) => {
			if (value !== undefined && value !== null && value !== '') {
				params = params.set(key, String(value));
			}
		});

		return params;
	}
}
