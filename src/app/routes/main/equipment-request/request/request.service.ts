import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';

import { ApiService } from 'src/app/core/services/api.service';

export interface EquipmentAvailability {
	isAvailableForRequestedPeriod: boolean;
	status: string;
	statusName?: string | null;
	lastUsageStartDate: string | null;
	lastUsageEndDate: string | null;
	availableFrom: string | null;
	conflictRequestNo: string | null;
	conflictCompanyUuid?: string | null;
	conflictCompanyCode?: string | null;
	conflictCompanyName?: string | null;
	conflictRequesterUuid?: string | null;
	conflictRequesterName?: string | null;
	conflictStartDate: string | null;
	conflictEndDate: string | null;
}

export interface RequestDetail {
	uuid?: string | null;
	equipmentCategoryId: number;
	equipmentCategoryName?: string | null;
	equipmentCategoryCode?: string | null;
	equipmentCategoryIcon?: string | null;
	categoryName?: string | null;

	equipmentUnitId?: number | null;
	equipmentUnitUuid?: string | null;
	equipmentUnitCode?: string | null;
	equipmentUnitName?: string | null;
	equipmentUnitAssetNumber?: string | null;
	equipmentUnitCapacityValue?: number | null;
	equipmentUnitCapacityUnit?: string | null;

	requiredCapacityValue: number;
	requiredCapacityUnit: string;
	quantity?: number;
	rate?: number | null;
	remarks?: string | null;

	availability?: EquipmentAvailability | null;
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
	detailCount?: number;
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
	operationalStatusCode?: string | null;
	operationalStatusName?: string | null;
	remarks?: string | null;
	imageUuid?: string | null;
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

	private companiesCache$?: Observable<RequestCompanyOption[]>;

	private readonly divisionsCache = new Map<
		number,
		Observable<RequestDivisionOption[]>
	>();

	private categoriesCache$?: Observable<CategoryOption[]>;
	private unitsCache$?: Observable<UnitOption[]>;
	private capacityUnitsCache$?: Observable<CapacityUnitOption[]>;

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

	getCompanies(): Observable<RequestCompanyOption[]> {
		if (!this.companiesCache$) {
			this.companiesCache$ = this.apiService
				.get('/company', this.compactParams({ isActive: 1 }))
				.pipe(shareReplay({ bufferSize: 1, refCount: false }));
		}

		return this.companiesCache$;
	}

	getDivisions(companyId?: number): Observable<RequestDivisionOption[]> {
		const cacheKey = Number(companyId) || 0;
		const cached = this.divisionsCache.get(cacheKey);

		if (cached) {
			return cached;
		}

		const request$ = this.apiService
			.get('/division', this.compactParams({ companyId, isActive: 1 }))
			.pipe(shareReplay({ bufferSize: 1, refCount: false }));

		this.divisionsCache.set(cacheKey, request$);

		return request$;
	}

	getCategories(): Observable<CategoryOption[]> {
		if (!this.categoriesCache$) {
			this.categoriesCache$ = this.apiService
				.get('/equipment-category', this.compactParams({ isActive: 1 }))
				.pipe(shareReplay({ bufferSize: 1, refCount: false }));
		}

		return this.categoriesCache$;
	}

	getUnits(): Observable<UnitOption[]> {
		if (!this.unitsCache$) {
			const params = new HttpParams().set('isActive', '1');

			this.unitsCache$ = this.apiService
				.get('/equipment-unit', params)
				.pipe(shareReplay({ bufferSize: 1, refCount: false }));
		}

		return this.unitsCache$;
	}

	getUnitImage(uuid: string): Observable<Blob> {
		return this.apiService.getBlob(`/equipment-unit/${uuid}/image`);
	}

	getCapacityUnits(): Observable<CapacityUnitOption[]> {
		if (!this.capacityUnitsCache$) {
			this.capacityUnitsCache$ = this.apiService
				.get(
					'/lookup',
					this.compactParams({
						lookupGroup: 'equipment_capacity_unit',
						isActive: 1,
					}),
				)
				.pipe(shareReplay({ bufferSize: 1, refCount: false }));
		}

		return this.capacityUnitsCache$;
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
