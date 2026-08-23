import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from 'src/app/core/services/api.service';

export interface UnitCategory {
	id: number;
	uuid: string;
	code: string;
	name: string;
	icon?: string | null;
	isActive: boolean | number;
}

export interface Unit {
	id: number;
	uuid: string;

	categoryId: number;
	categoryUuid: string;
	categoryCode: string;
	categoryName: string;
	categoryIcon?: string | null;

	unitCode: string;
	unitName: string;

	assetNumber?: string | null;
	modelNumber?: string | null;
	plateNumber?: string | null;
	capacityValue?: number | null;
	capacityUnit?: string | null;
	capacityUnitName?: string | null;
	capacityUnitAlias?: string | null;

	operationalStatusCode: string;
	operationalStatusName?: string | null;
	operationalStatusAlias?: string | null;

	remarks?: string | null;

	imageUuid?: string | null;
	imageOriginalName?: string | null;
	imageMimeType?: string | null;
	imageFileSize?: number | null;
	imageUpdatedAt?: string | null;

	isActive: boolean | number;

	createdAt?: string;
	updatedAt?: string;
}

export interface CapacityUnitOption {
	lookupId: number;
	lookupCode: string;
	lookupValue: string;
	lookupAlias?: string | null;
	lookupGroup: string;
	isActive: number;
}

export interface OperationalStatusOption {
	lookupId: number;
	lookupCode: string;
	lookupValue: string;
	lookupAlias?: string | null;
	lookupGroup: string;
	isActive: number;
}

export interface UnitPayload {
	categoryUuid: string;

	unitCode: string;
	unitName: string;

	assetNumber: string | null;
	modelNumber: string | null;
	plateNumber: string | null;
	capacityValue: number;
	capacityUnit: string;
	operationalStatusCode: string;
	remarks: string | null;

	isActive: boolean;
}

export interface UnitDialogData {
	mode: 'create' | 'edit';
	unit?: Unit;
	categories: UnitCategory[];
	capacityUnits: CapacityUnitOption[];
	operationalStatuses: OperationalStatusOption[];
	imageUrl?: string | null;
}

export interface UnitDialogResult {
	action: 'save';
	payload: UnitPayload;
	imageFile?: File | null;
	removeImage?: boolean;
}

@Injectable({
	providedIn: 'root',
})
export class UnitService {
	constructor(private apiService: ApiService) {}

	getUnits(params?: {
		search?: string;
		categoryUuid?: string;
		isActive?: boolean | null;
		operationalStatusCode?: string;
	}) {
		const queryParams: string[] = [];

		if (params?.search?.trim()) {
			queryParams.push(
				`search=${encodeURIComponent(params.search.trim())}`,
			);
		}

		if (params?.categoryUuid) {
			queryParams.push(
				`categoryUuid=${encodeURIComponent(params.categoryUuid)}`,
			);
		}

		if (params?.isActive !== undefined && params?.isActive !== null) {
			queryParams.push(`isActive=${params.isActive}`);
		}

		if (params?.operationalStatusCode?.trim()) {
			queryParams.push(
				`operationalStatusCode=${encodeURIComponent(
					params.operationalStatusCode.trim().toUpperCase(),
				)}`,
			);
		}

		const queryString = queryParams.length
			? `?${queryParams.join('&')}`
			: '';

		return this.apiService.get(`/equipment-unit${queryString}`);
	}

	getUnit(uuid: string) {
		return this.apiService.get(`/equipment-unit/${uuid}`);
	}

	getCategories() {
		return this.apiService.get('/equipment-category');
	}

	getCapacityUnits(): Observable<CapacityUnitOption[]> {
		return this.apiService.get(
			'/lookup',
			new HttpParams()
				.set('lookupGroup', 'equipment_capacity_unit')
				.set('isActive', '1'),
		);
	}

	getOperationalStatuses(): Observable<OperationalStatusOption[]> {
		return this.apiService.get(
			'/lookup',
			new HttpParams()
				.set('lookupGroup', 'equipment_operational_status')
				.set('isActive', '1'),
		);
	}

	createUnit(payload: UnitPayload) {
		return this.apiService.post('/equipment-unit', payload);
	}

	updateUnit(uuid: string, payload: UnitPayload) {
		return this.apiService.put(`/equipment-unit/${uuid}`, payload);
	}

	getUnitImage(uuid: string): Observable<Blob> {
		return this.apiService.getBlob(`/equipment-unit/${uuid}/image`);
	}

	uploadUnitImage(uuid: string, imageFile: File) {
		const formData = new FormData();
		formData.append('image', imageFile);

		return this.apiService.upload(`/equipment-unit/${uuid}/image`, formData);
	}

	deleteUnitImage(uuid: string) {
		return this.apiService.delete(`/equipment-unit/${uuid}/image`);
	}

	deactivateUnit(uuid: string) {
		return this.apiService.delete(`/equipment-unit/${uuid}`);
	}
}
