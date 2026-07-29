import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from 'src/app/core/services/api.service';

export interface EquipmentRequestDetail {
	uuid?: string | null;
	equipmentCategoryId: number;
	equipmentUnitId?: number | null;
	quantity: number;
	rate?: number | null;
	remarks?: string | null;
}

export interface EquipmentRequestApproval {
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

export interface EquipmentRequestHistory {
	uuid: string;
	activity: string;
	description: string;
	userName?: string | null;
	createdAt: string;
}

export interface EquipmentRequestAction {
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

export interface EquipmentRequestMaster {
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
	details?: EquipmentRequestDetail[];
	approvals?: EquipmentRequestApproval[];
	histories?: EquipmentRequestHistory[];
	availableActions?: EquipmentRequestAction[];
}

export interface EquipmentRequestFilter {
	search?: string;
	status?: string;
	companyId?: number;
	divisionUuid?: string;
	startDate?: string;
	endDate?: string;
	isActive?: boolean;
}

export interface EquipmentRequestPayload {
	companyId: number;
	divisionUuid: string | null;
	startDate: string;
	endDate: string;
	purpose: string | null;
	notes: string | null;
	details: EquipmentRequestDetail[];
}

export interface EquipmentRequestActionPayload {
	actionCode: string;
	remarks?: string | null;
}

export interface EquipmentRequestCompanyOption {
	id: number;
	uuid: string;
	code: string;
	name: string;
}

export interface EquipmentRequestDivisionOption {
	uuid: string;
	code: string;
	name: string;
	companyId?: number | null;
}

export interface EquipmentCategoryOption {
	id: number;
	uuid?: string | null;
	code?: string | null;
	name: string;
}

export interface EquipmentUnitOption {
	id: number;
	uuid: string;
	categoryId: number;
	unitCode: string;
	unitName: string;
	assetNumber?: string | null;
	modelNumber?: string | null;
	plateNumber?: string | null;
	remarks?: string | null;
}

export interface EquipmentRequestFormDialogData {
	mode: 'create' | 'edit';
	request?: EquipmentRequestMaster;
	company: EquipmentRequestCompanyOption | null;
	divisions: EquipmentRequestDivisionOption[];
	categories: EquipmentCategoryOption[];
	units: EquipmentUnitOption[];
}

@Injectable({ providedIn: 'root' })
export class EquipmentRequestService {
	private readonly baseUrl = '/equipment-request';

	constructor(private readonly apiService: ApiService) {}

	getRequests(
		filter: EquipmentRequestFilter = {},
	): Observable<EquipmentRequestMaster[]> {
		return this.apiService.get(this.baseUrl, this.compactParams(filter));
	}

	getRequest(requestUuid: string): Observable<EquipmentRequestMaster> {
		return this.apiService.get(`${this.baseUrl}/${requestUuid}`);
	}

	createRequest(
		payload: EquipmentRequestPayload,
	): Observable<EquipmentRequestMaster> {
		return this.apiService.post(this.baseUrl, payload);
	}

	updateRequest(
		requestUuid: string,
		payload: EquipmentRequestPayload,
	): Observable<EquipmentRequestMaster> {
		return this.apiService.put(`${this.baseUrl}/${requestUuid}`, payload);
	}

	deleteRequest(requestUuid: string): Observable<{ uuid: string }> {
		return this.apiService.delete(`${this.baseUrl}/${requestUuid}`);
	}

	executeAction(
		requestUuid: string,
		payload: EquipmentRequestActionPayload,
	): Observable<EquipmentRequestMaster> {
		return this.apiService.post(
			`${this.baseUrl}/${requestUuid}/action`,
			payload,
		);
	}

	/* Existing master routes in the project. Mapping is deliberately isolated here. */
	getCompanies(): Observable<EquipmentRequestCompanyOption[]> {
		return this.apiService.get(
			'/company',
			this.compactParams({ isActive: 1 }),
		);
	}

	getDivisions(
		companyId?: number,
	): Observable<EquipmentRequestDivisionOption[]> {
		return this.apiService.get(
			'/division',
			this.compactParams({ companyId, isActive: 1 }),
		);
	}

	getEquipmentCategories(): Observable<EquipmentCategoryOption[]> {
		return this.apiService.get(
			'/equipment-category',
			this.compactParams({ isActive: 1 }),
		);
	}

	getEquipmentUnits(): Observable<EquipmentUnitOption[]> {
		const params = new HttpParams().set('isActive', '1');
		return this.apiService.get('/equipment-unit', params);
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
