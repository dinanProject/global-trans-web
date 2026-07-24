import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';

export interface Project {
	projectName: string;
	companyName: string;
}

export interface Unit {
	unitId: number;
	projectName: string;
	companyName: string;
	blockName: string;
	unitNo: string;
	unitName: string;
	unitCategoryId: number;
	unitCategoryName: string;
	unitTypeId: number;
	unitTypeName: string;
	lt: number;
	lb: number;
	floor: number;
	bedRoom: number;
	bathRoom: number;
	carPort: number;
	salesStatusId: number;
	salesStatusName: string;
	progressStatusId: number;
	progressStatusName: string;
	cashPrice: number;
	isHoek: string;
	isShowUnit: string;
	isInhabited: string;
	isOpen: string;
	lastModifiedDate: string;
	lastModifiedUser: string;
}

export interface UnitCategory {
	unitCategoryId: number;
	unitCategoryName: string;
}

export interface UnitType {
	unitTypeId: number;
	unitTypeName: string;
}

export interface SalesStatus {
	salesStatusId: number;
	salesStatusName: string;
}

export interface ProgressStatus {
	progressStatusId: number;
	progressStatusName: string;
}

export interface PaymentPlan {
	paymentPlanId: number;
	paymentPlanName: number;
	remark: string;
}

export interface Price {
	unitPriceId?: number;
	progressStatusId: number;
	paymentPlanId: number;
	paymentPlanName: string;
	remark: string;
	price: number;
	isAdded?: boolean;
	isEdited?: boolean;
	isDeleted?: boolean;
}

@Injectable({
	providedIn: 'root'
})
export class UnitService {

	constructor(
		private apiService: ApiService
	) { }

	getUnit(projectId: number, unitId: number): Observable<{
		unit: Unit,
		prices: Price[]
	}> {
		return this.apiService.get(`/backend/property-management/project/${projectId}/unit/${unitId}`);
	}

	getProject(projectId: number): Observable<Project> {
		return this.apiService.get(`/backend/property-management/project/${projectId}/unit/project`);
	}

	getUnitCategories(projectId: number): Observable<UnitCategory[]> {
		return this.apiService.get(`/backend/property-management/project/${projectId}/unit/unit-category`);
	}

	getUnitTypes(projectId: number): Observable<UnitType[]> {
		return this.apiService.get(`/backend/property-management/project/${projectId}/unit/unit-type`);
	}

	getSalesStatuses(projectId: number): Observable<SalesStatus[]> {
		return this.apiService.get(`/backend/property-management/project/${projectId}/unit/sales-status`);
	}

	getProgressStatuses(projectId: number): Observable<ProgressStatus[]> {
		return this.apiService.get(`/backend/property-management/project/${projectId}/unit/progress-status`);
	}

	getPaymentPlans(projectId: number): Observable<PaymentPlan[]> {
		return this.apiService.get(`/backend/property-management/project/${projectId}/unit/payment-plan`);
	}

	insert(projectId: number, data: any) {
		return this.apiService.post(`/backend/property-management/project/${projectId}/unit`, data);
	}

	update(projectId: number, unitId: number, data: any) {
		return this.apiService.put(`/backend/property-management/project/${projectId}/unit/${unitId}`, data);
	}
}
