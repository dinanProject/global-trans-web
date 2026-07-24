import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';

export interface Unit {
	unitId: number;
	projectId: number;
	projectName: string;
	companyId: number;
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

export interface Project {
	companyId: number;
	projectId: number;
	projectName: string;
}

export interface Company {
	companyId: number;
	companyName: string;
}

export interface UnitCategory {
	unitCategoryId: number;
	unitCategoryName: string;
}

export interface UnitType {
	unitTypeId: number;
	unitTypeName: string;
	projectId: number;
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
	projectId: number;
}

export interface Price {
	unitPriceId?: number;
	progressStatusId: number;
	paymentPlanId: number;
	paymentPlanName: string;
	price: number;
	isAdded?: boolean;
	isEdited?: boolean;
	isDeleted?: boolean;
}

@Injectable({
	providedIn: 'root'
})
export class DetailService {

	constructor(
		private apiService: ApiService
	) { }

	getUnit(unitId: number): Observable<{
		unit: Unit,
		projects: Project[],
		companies: Company[],
		unitTypes: UnitType[],
		unitCategories: UnitCategory[],
		salesStatuses: SalesStatus[],
		progressStatuses: ProgressStatus[],
		paymentPlans: PaymentPlan[],
		prices: Price[]
	}> {
		return this.apiService.get(`/backend/property-management/unit/${unitId}`);
	}

	update(unitId: number, data: any) {
		return this.apiService.put(`/backend/property-management/unit/${unitId}`, data);
	}
}
