import { Injectable } from '@angular/core';

import { ApiService } from 'src/app/core/services/api.service';

export interface Category {
	id: number;
	uuid: string;
	code: string;
	name: string;

	description?: string | null;
	icon?: string | null;

	isActive: boolean | number;

	createdAt?: string;
	updatedAt?: string;
}

export interface CategoryPayload {
	code: string;
	name: string;
	description: string | null;
	icon: string | null;
	isActive: boolean;
}

export interface CategoryDialogData {
	mode: 'create' | 'edit';
	category?: Category;
}

export interface CategoryDialogResult {
	action: 'save';
	payload: CategoryPayload;
}

@Injectable({
	providedIn: 'root',
})
export class CategoryService {
	constructor(private apiService: ApiService) {}

	getCategories(params?: { search?: string; isActive?: boolean | null }) {
		const queryParams: string[] = [];

		if (params?.search?.trim()) {
			queryParams.push(
				`search=${encodeURIComponent(params.search.trim())}`,
			);
		}

		if (params?.isActive !== undefined && params?.isActive !== null) {
			queryParams.push(`isActive=${params.isActive}`);
		}

		const queryString = queryParams.length
			? `?${queryParams.join('&')}`
			: '';

		return this.apiService.get(`/equipment-category${queryString}`);
	}

	getCategory(uuid: string) {
		return this.apiService.get(`/equipment-category/${uuid}`);
	}

	createCategory(payload: CategoryPayload) {
		return this.apiService.post('/equipment-category', payload);
	}

	updateCategory(uuid: string, payload: CategoryPayload) {
		return this.apiService.put(`/equipment-category/${uuid}`, payload);
	}

	deactivateCategory(uuid: string) {
		return this.apiService.delete(`/equipment-category/${uuid}`);
	}
}
