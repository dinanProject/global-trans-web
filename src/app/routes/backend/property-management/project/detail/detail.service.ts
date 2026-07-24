import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from 'src/app/services/api.service';
// import { ProjectType } from '../project-type';

export interface ProjectType {
	projectTypeId: number;
	projectTypeName: string;
}

export interface Company {
	companyId: number;
	companyName: string;
}

export interface Project {
	projectId: number;
	projectName: string;
	city: string;
	remark: string;
	projectTypeId: number;
	projectTypeName: string;
	companyId: number;
	companyName: string;
	logoPath: string;
	siteplanPath: string;
	launchingDate: Date;
}

export interface PaymentPlan {
	paymentPlanId: number;
	paymentMethodId: number;
	paymentMethodName: string;
	paymentPlanName: string;
	remark: string;
	lastModifiedDate: string;
	lastModifiedUser: string;
}

export interface UnitType {
	unitTypeId: number;
	unitTypeName: string;
	remark: string;
	unitCount: number;
}

export interface LeadPropertyAgent {
	projectLeadPropertyAgentId: number;
	propertyAgentId: number;
	propertyAgentCode: string;
	propertyAgentName: string;
	startDate: string;
	endDate: string;
	status: string;
}

export interface UnitTypeMedia {
	unitTypeMediaId: number;
	mediaTitle: string;
	mediaPath: string;
}

export interface Unit {
	unitId: number;
	unitName: string;
	unitCategoryName: string;
	unitTypeName: string;
	salesStatusName: string;
	formattedSalesStatusName: string;
	progressStatusName: string;
	cashPrice: number;
	lt: number;
	lb: number;
}
@Injectable({
	providedIn: 'root'
})
export class DetailService {

	constructor(
		private apiService: ApiService
	) { }

	getCompanies(): Observable<Array<Company>> {
		return this.apiService.get(`/backend/property-management/project/company`);
	}

	getProject(projectId: number): Observable<Project> {
		return this.apiService.get(`/backend/property-management/project/${projectId}`);
	}

	getProjectTypes(): Observable<Array<ProjectType>> {
		return this.apiService.get(`/backend/property-management/project/project-type`);
	}

	insertProject(data) {
		return this.apiService.upload(`/backend/property-management/project`, data);
	}

	updateProject(projectId, data) {
		return this.apiService.upload(`/backend/property-management/project/${projectId}`, data, true);
	}

	getPaymentPlans(projectId: number): Observable<PaymentPlan[]> {
		return this.apiService.get(`/backend/property-management/project/${projectId}/payment-plan`);
	}

	getUnitTypes(projectId: number): Observable<UnitType[]> {
		return this.apiService.get(`/backend/property-management/project/${projectId}/unit-type`);
	}

	getLeadPropertyAgents(projectId: number): Observable<LeadPropertyAgent[]> {
		return this.apiService.get(`/backend/property-management/project/${projectId}/lead-property-agent`);
	}

	deleteLeadPropertyAgent(projectId: number, projectLeadPropertyAgentId: number) {
		return this.apiService.delete(`/backend/property-management/project/${projectId}/lead-property-agent/${projectLeadPropertyAgentId}`);
	}

	deletePaymentPlan(projectId: number, paymentPlanId: number) {
		return this.apiService.delete(`/backend/property-management/project/${projectId}/payment-plan/${paymentPlanId}`);
	}

	getUnits(projectId: number): Observable<{
		units: Unit[]
	}> {
		return this.apiService.get(`/backend/property-management/project/${projectId}/unit`);
	}
}
