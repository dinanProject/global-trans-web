import { Injectable } from '@angular/core';

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
	remarks?: string | null;

	isActive: boolean | number;

	createdAt?: string;
	updatedAt?: string;
}

export interface UnitPayload {
	categoryUuid: string;

	unitCode: string;
	unitName: string;

	assetNumber: string | null;
	modelNumber: string | null;
	plateNumber: string | null;
	remarks: string | null;

	isActive: boolean;
}

export interface UnitDialogData {
	mode: 'create' | 'edit';
	unit?: Unit;
	categories: UnitCategory[];
}

export interface UnitDialogResult {
	action: 'save';
	payload: UnitPayload;
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

	createUnit(payload: UnitPayload) {
		return this.apiService.post('/equipment-unit', payload);
	}

	updateUnit(uuid: string, payload: UnitPayload) {
		return this.apiService.put(`/equipment-unit/${uuid}`, payload);
	}

	deactivateUnit(uuid: string) {
		return this.apiService.delete(`/equipment-unit/${uuid}`);
	}
}
