import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from 'src/app/core/services/api.service';

export interface DashboardTrendItem {
	label: string;
	assigned: number;
	started: number;
	completed: number;
}

export interface EquipmentUtilization {
	totalUnits: number;
	available: number;
	waitingStart: number;
	inOperation: number;
}

export interface SlaPerformance {
	onTime: number;
	lateStart: number;
	overdue: number;
	completedLate: number;
}

export interface DashboardRankingItem {
	uuid: string | null;
	code: string | null;
	name: string;
	total: number;
}

export interface DashboardDateRange {
	startDate: string;
	endDate: string;
}

export interface DashboardOverview {
	period: string;
	dateRange: DashboardDateRange;
	operationsTrend: DashboardTrendItem[];
	equipmentUtilization: EquipmentUtilization;
	slaPerformance: SlaPerformance;
	topEquipmentCategories: DashboardRankingItem[];
	operationsByCompany: DashboardRankingItem[];
}

export interface DashboardFilters {
	period: string;
	companyUuid?: string;
	divisionUuid?: string;
}

export interface DashboardOverview {
	period: string;
	dateRange: DashboardDateRange;
	operationsTrend: DashboardTrendItem[];
	equipmentUtilization: EquipmentUtilization;
	slaPerformance: SlaPerformance;
	topEquipmentCategories: DashboardRankingItem[];
	operationsByCompany: DashboardRankingItem[];
}

@Injectable({
	providedIn: 'root',
})
export class HomeService {
	constructor(private readonly apiService: ApiService) {}

	getOverview(filters: DashboardFilters): Observable<DashboardOverview> {
		let params = new HttpParams().set('period', filters.period);
		if (filters.companyUuid) {
			params = params.set('companyUuid', filters.companyUuid);
		}
		if (filters.divisionUuid) {
			params = params.set('divisionUuid', filters.divisionUuid);
		}
		return this.apiService.get(
			'/home',
			params,
		) as Observable<DashboardOverview>;
	}
}
