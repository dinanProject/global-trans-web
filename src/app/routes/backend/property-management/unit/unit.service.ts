import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

export interface Company {
	companyId: number;
	companyName: string;
}

export interface Project {
	companyId: number;
	projectId: number;
	projectName: string;
}

export interface SalesStatus {
	salesStatusId: number;
	salesStatusName: string;
}

export interface Price {
	unitPriceId: number;
	paymentPlanId: string;
	paymentPlanName: string;
	price: number;
}

export interface Unit {
	unitId: number;
	unitName: string;
	projectId: number;
	projectName: string;
	companyId: number;
	companyName: string;
	lt: number;
	lb: number;
	salesStatusId: number;
	salesStatusName: string;
	progressStatusName: string;
	isShowUnit: boolean;
	isUnitHasPrice: boolean;
	prices: Price[];
}
@Injectable({
	providedIn: 'root'
})
export class UnitService {

	constructor(
		private apiService: ApiService
	) { }

	getCompanies() {
		return this.apiService.get(`/backend/property-management/unit/company`);
	}

	getProjects() {
		return this.apiService.get(`/backend/property-management/unit/project`);
	}

	getSalesStatuses() {
		return this.apiService.get(`/backend/property-management/unit/sales-status`);
	}

	getUnits(companyId: number, projectId: number) {
		return this.apiService.get(`/backend/property-management/unit?companyId=${companyId}&projectId=${projectId}`);
	}

	save(updatedUnits, addedPrice, editedPrice) {
		return this.apiService.put(`/backend/property-management/unit`, {
			updatedUnits,
			addedPrice,
			editedPrice
		});
	}
}
