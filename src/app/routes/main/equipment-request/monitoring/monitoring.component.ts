import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import {
	debounceTime,
	distinctUntilChanged,
	finalize,
	takeUntil,
} from 'rxjs/operators';
import { environment } from 'src/environments/environment';

interface MonitoringSummary {
	activeOperation: number;
	assignedWaitingStart: number;
	overdue: number;
	lateStart: number;
	completedToday: number;
	availableUnit: number;
}

interface MonitoringAssignment {
	id: number;
	uuid: string;
	statusCode: string;
	requestStatus: string;
	operationStatus: string;
	slaStatus: string;

	plannedStartDate: string | null;
	plannedEndDate: string | null;
	actualStartDate: string | null;
	actualEndDate: string | null;

	remainingDays: number | null;
	isOverdue: boolean;
	isLateStart: boolean;
	isCompletedToday: boolean;

	requestUuid: string;
	requestNo: string;
	requestDate: string | null;

	companyUuid: string | null;
	companyCode: string | null;
	companyName: string | null;

	divisionUuid: string | null;
	divisionCode: string | null;
	divisionName: string | null;

	equipmentCategoryUuid: string | null;
	equipmentCategoryCode: string | null;
	equipmentCategoryName: string | null;
	equipmentCategoryIcon: string | null;

	equipmentUnitUuid: string;
	equipmentUnitCode: string;
	equipmentUnitName: string;
	assetNumber: string | null;
}

interface MonitoringOverview {
	summary: MonitoringSummary;
	assignments: MonitoringAssignment[];
}

interface MonitoringFilters {
	search: string;
	companyUuid: string;
	divisionUuid: string;
	equipmentUuid: string;
	status: string;
	startDate: string;
	endDate: string;
	overdueOnly: boolean;
}

interface CompanyOption {
	uuid: string;
	code: string;
	name: string;
}

interface DivisionOption {
	uuid: string;
	companyUuid: string;
	code: string;
	name: string;
}

interface EquipmentOption {
	uuid: string;
	code: string;
	name: string;
}

interface ApiResponse<T> {
	data?: T;
	result?: T;
}

@Component({
	selector: 'app-equipment-request-monitoring',
	templateUrl: './monitoring.component.html',
	styleUrls: ['./monitoring.component.scss'],
	standalone: false,
})
export class MonitoringComponent implements OnInit, OnDestroy {
	private readonly monitoringUrl = `${environment.apiUrl}/equipment-request/monitoring`;

	summary: MonitoringSummary = this.createEmptySummary();
	assignments: MonitoringAssignment[] = [];

	companyOptions: CompanyOption[] = [];
	divisionOptions: DivisionOption[] = [];
	equipmentOptions: EquipmentOption[] = [];

	filters: MonitoringFilters = this.createEmptyFilters();
	private readonly searchChange$ = new Subject<string>();
	private readonly destroy$ = new Subject<void>();

	loading = false;
	loadingSummary = false;
	loadingAssignments = false;

	errorMessage = '';
	lastUpdatedAt: Date | null = null;

	readonly loadingRows = Array.from({ length: 6 });

	constructor(private readonly http: HttpClient) {}

	ngOnInit(): void {
		this.searchChange$
			.pipe(
				debounceTime(400),
				distinctUntilChanged(),
				takeUntil(this.destroy$),
			)
			.subscribe(() => {
				this.loadMonitoring(false);
			});
		this.loadMonitoring();
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
		this.searchChange$.complete();
	}

	get filteredDivisionOptions(): DivisionOption[] {
		if (!this.filters.companyUuid) {
			return this.divisionOptions;
		}

		return this.divisionOptions.filter(
			(division) => division.companyUuid === this.filters.companyUuid,
		);
	}

	get hasActiveFilters(): boolean {
		return Boolean(
			this.filters.search ||
			this.filters.companyUuid ||
			this.filters.divisionUuid ||
			this.filters.equipmentUuid ||
			(this.filters.status && this.filters.status !== 'ACTIVE') ||
			this.filters.startDate ||
			this.filters.endDate ||
			this.filters.overdueOnly,
		);
	}

	getEquipmentIcon(icon?: string | null): string {
		const normalizedIcon = icon?.trim();

		if (!normalizedIcon || normalizedIcon.startsWith('fas ')) {
			return 'assets/icons/equipment/equipment.svg';
		}

		return `assets/icons/equipment/${normalizedIcon}`;
	}

	onSearchChange(value: string): void {
		this.searchChange$.next(value || '');
	}

	onFilterChange(): void {
		this.loadMonitoring(false);
	}

	refresh(): void {
		this.loadMonitoring();
	}

	resetFilters(): void {
		this.filters = this.createEmptyFilters();
		this.loadMonitoring(false);
	}

	onCompanyChange(): void {
		if (
			this.filters.divisionUuid &&
			!this.filteredDivisionOptions.some(
				(division) => division.uuid === this.filters.divisionUuid,
			)
		) {
			this.filters.divisionUuid = '';
		}

		this.loadMonitoring(false);
	}

	trackByUuid(index: number, assignment: MonitoringAssignment): string {
		return assignment.uuid;
	}

	getOperationStatusLabel(status: string): string {
		const labels: Record<string, string> = {
			ASSIGNED: 'Assigned',
			RUNNING: 'Running',
			IN_OPERATION: 'Running',
			COMPLETED: 'Completed',
		};

		return labels[status] || this.formatStatus(status);
	}

	getOperationStatusClass(status: string): string {
		const classes: Record<string, string> = {
			ASSIGNED: 'operation-assigned',
			RUNNING: 'operation-running',
			IN_OPERATION: 'operation-running',
			COMPLETED: 'operation-completed',
		};

		return classes[status] || 'operation-default';
	}

	getOperationStatusIcon(status: string): string {
		const icons: Record<string, string> = {
			ASSIGNED: 'fa-hourglass-half',
			RUNNING: 'fa-play',
			IN_OPERATION: 'fa-play',
			COMPLETED: 'fa-check',
		};

		return icons[status] || 'fa-circle';
	}

	getSlaStatusLabel(status: string): string {
		const labels: Record<string, string> = {
			ASSIGNED: 'Assigned',
			LATE_START: 'Late Start',
			ON_TIME_START: 'On Time Start',
			OVERDUE: 'Overdue',
			COMPLETED_ON_TIME: 'Completed On Time',
			COMPLETED_LATE: 'Completed Late',
		};

		return labels[status] || this.formatStatus(status);
	}

	getSlaStatusClass(status: string): string {
		const classes: Record<string, string> = {
			ASSIGNED: 'sla-assigned',
			LATE_START: 'sla-late',
			ON_TIME_START: 'sla-on-time',
			OVERDUE: 'sla-overdue',
			COMPLETED_ON_TIME: 'sla-completed',
			COMPLETED_LATE: 'sla-completed-late',
		};

		return classes[status] || 'sla-assigned';
	}

	getRemainingDaysLabel(assignment: MonitoringAssignment): string {
		if (assignment.actualEndDate) {
			if (assignment.slaStatus === 'COMPLETED_ON_TIME') {
				return 'Completed within SLA';
			}

			if (assignment.slaStatus === 'COMPLETED_LATE') {
				const lateDays = Math.abs(assignment.remainingDays || 0);

				return lateDays > 0
					? `Completed ${lateDays} day${lateDays === 1 ? '' : 's'} late`
					: 'Completed late';
			}

			return 'Operation completed';
		}

		if (assignment.remainingDays === null) {
			return 'Schedule unavailable';
		}

		if (assignment.remainingDays < 0) {
			const overdueDays = Math.abs(assignment.remainingDays);

			return `${overdueDays} day${overdueDays === 1 ? '' : 's'} overdue`;
		}

		if (assignment.remainingDays === 0) {
			return 'Due today';
		}

		return `${assignment.remainingDays} day${
			assignment.remainingDays === 1 ? '' : 's'
		} remaining`;
	}

	private loadMonitoring(initializeOptions = true): void {
		this.errorMessage = '';
		this.loading = true;
		this.loadingSummary = true;
		this.loadingAssignments = true;

		const params = this.buildQueryParams();

		this.http
			.get<ApiResponse<MonitoringOverview> | MonitoringOverview>(
				`${this.monitoringUrl}/overview`,
				{ params },
			)
			.pipe(
				takeUntil(this.destroy$),
				finalize(() => {
					this.loading = false;
					this.loadingSummary = false;
					this.loadingAssignments = false;
				}),
			)
			.subscribe({
				next: (response) => {
					const overview =
						this.extractResponseData<MonitoringOverview>(response);

					this.summary =
						overview?.summary || this.createEmptySummary();

					this.assignments = overview?.assignments || [];

					if (initializeOptions || this.companyOptions.length === 0) {
						this.buildFilterOptions(this.assignments);
					}

					this.lastUpdatedAt = new Date();
				},
				error: (error) => {
					console.error('Failed to load monitoring data:', error);

					this.summary = this.createEmptySummary();
					this.assignments = [];

					this.errorMessage =
						error?.error?.message ||
						error?.message ||
						'Failed to load equipment monitoring data.';
				},
			});
	}

	private buildQueryParams(): HttpParams {
		let params = new HttpParams();

		if (this.filters.search.trim()) {
			params = params.set('search', this.filters.search.trim());
		}

		if (this.filters.companyUuid) {
			params = params.set('companyUuid', this.filters.companyUuid);
		}

		if (this.filters.divisionUuid) {
			params = params.set('divisionUuid', this.filters.divisionUuid);
		}

		if (this.filters.equipmentUuid) {
			params = params.set('equipmentUuid', this.filters.equipmentUuid);
		}

		if (this.filters.status) {
			params = params.set('status', this.filters.status);
		}

		if (this.filters.startDate) {
			params = params.set('startDate', this.filters.startDate);
		}

		if (this.filters.endDate) {
			params = params.set('endDate', this.filters.endDate);
		}

		if (this.filters.overdueOnly) {
			params = params.set('overdueOnly', 'true');
		}

		return params;
	}

	private buildFilterOptions(assignments: MonitoringAssignment[]): void {
		const companies = new Map<string, CompanyOption>();
		const divisions = new Map<string, DivisionOption>();
		const equipment = new Map<string, EquipmentOption>();

		assignments.forEach((assignment) => {
			if (
				assignment.companyUuid &&
				assignment.companyCode &&
				assignment.companyName
			) {
				companies.set(assignment.companyUuid, {
					uuid: assignment.companyUuid,
					code: assignment.companyCode,
					name: assignment.companyName,
				});
			}

			if (
				assignment.divisionUuid &&
				assignment.companyUuid &&
				assignment.divisionCode &&
				assignment.divisionName
			) {
				divisions.set(assignment.divisionUuid, {
					uuid: assignment.divisionUuid,
					companyUuid: assignment.companyUuid,
					code: assignment.divisionCode,
					name: assignment.divisionName,
				});
			}

			if (
				assignment.equipmentUnitUuid &&
				assignment.equipmentUnitCode &&
				assignment.equipmentUnitName
			) {
				equipment.set(assignment.equipmentUnitUuid, {
					uuid: assignment.equipmentUnitUuid,
					code: assignment.equipmentUnitCode,
					name: assignment.equipmentUnitName,
				});
			}
		});

		this.companyOptions = Array.from(companies.values()).sort((a, b) =>
			a.name.localeCompare(b.name),
		);

		this.divisionOptions = Array.from(divisions.values()).sort((a, b) =>
			a.name.localeCompare(b.name),
		);

		this.equipmentOptions = Array.from(equipment.values()).sort((a, b) =>
			a.name.localeCompare(b.name),
		);
	}

	private extractResponseData<T>(response: ApiResponse<T> | T): T {
		if (
			response &&
			typeof response === 'object' &&
			'data' in response &&
			(response as ApiResponse<T>).data !== undefined
		) {
			return (response as ApiResponse<T>).data as T;
		}

		if (
			response &&
			typeof response === 'object' &&
			'result' in response &&
			(response as ApiResponse<T>).result !== undefined
		) {
			return (response as ApiResponse<T>).result as T;
		}

		return response as T;
	}

	private formatStatus(status: string): string {
		if (!status) {
			return 'Unknown';
		}

		return status
			.toLowerCase()
			.split('_')
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ');
	}

	private createEmptySummary(): MonitoringSummary {
		return {
			activeOperation: 0,
			assignedWaitingStart: 0,
			overdue: 0,
			lateStart: 0,
			completedToday: 0,
			availableUnit: 0,
		};
	}

	private createEmptyFilters(): MonitoringFilters {
		return {
			search: '',
			companyUuid: '',
			divisionUuid: '',
			equipmentUuid: '',
			status: 'ACTIVE',
			startDate: '',
			endDate: '',
			overdueOnly: false,
		};
	}
}
