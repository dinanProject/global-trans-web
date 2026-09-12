import { HttpClient, HttpParams } from '@angular/common/http';
import {
	Component,
	OnDestroy,
	OnInit,
	TemplateRef,
	ViewChild,
} from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import {
	debounceTime,
	distinctUntilChanged,
	finalize,
	takeUntil,
} from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { RequestService } from '../request/request.service';

interface MonitoringSummary {
	activeOperation: number;
	waitingStart: number;
	overdue: number;
	onSchedule: number;
	completedToday: number;
	availableUnit: number;
	maintenanceUnit: number;
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

type MonitoringViewMode = 'WORKLIST' | 'CALENDAR';
type CalendarHorizon = 14 | 30;

interface CalendarDay {
	date: Date;
	key: string;
	dayLabel: string;
	dateLabel: string;
	isToday: boolean;
}

interface CalendarAgendaGroup {
	key: string;
	dayLabel: string;
	dateLabel: string;
	isToday: boolean;
	assignments: MonitoringAssignment[];
}

@Component({
	selector: 'app-equipment-request-monitoring',
	templateUrl: './monitoring.component.html',
	styleUrls: ['./monitoring.component.scss'],
	standalone: false,
})
export class MonitoringComponent implements OnInit, OnDestroy {
	@ViewChild('unitImagePreviewDialog')
	private unitImagePreviewDialog!: TemplateRef<unknown>;
	private unitImagePreviewDialogRef: MatDialogRef<unknown> | null = null;
	private readonly monitoringUrl = `${environment.apiUrl}/equipment-request/monitoring`;

	summary: MonitoringSummary = this.createEmptySummary();
	assignments: MonitoringAssignment[] = [];

	companyOptions: CompanyOption[] = [];
	divisionOptions: DivisionOption[] = [];
	equipmentOptions: EquipmentOption[] = [];

	filters: MonitoringFilters = this.createEmptyFilters();
	private readonly searchChange$ = new Subject<string>();
	private readonly destroy$ = new Subject<void>();
	readonly unitImageUrls = new Map<string, string>();
	previewUnitUuid: string | null = null;
	private readonly unavailableUnitImages = new Set<string>();
	private imageLoadVersion = 0;

	loading = false;
	loadingSummary = false;
	loadingAssignments = false;

	errorMessage = '';
	lastUpdatedAt: Date | null = null;

	readonly loadingRows = Array.from({ length: 6 });
	readonly worklistPageSize = 4;
	worklistPage = 1;

	viewMode: MonitoringViewMode = 'WORKLIST';
	calendarHorizon: CalendarHorizon = 14;
	calendarDays: CalendarDay[] = [];
	calendarStartDate = '';
	calendarEndDate = '';

	constructor(
		private readonly http: HttpClient,
		private readonly requestService: RequestService,
		private readonly dialog: MatDialog,
	) {}

	ngOnInit(): void {
		this.updateCalendarWindow();
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
		this.unitImagePreviewDialogRef?.close();
		this.imageLoadVersion += 1;
		this.releaseUnitImages();
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

	get worklistTotalPages(): number {
		return Math.max(1, Math.ceil(this.assignments.length / this.worklistPageSize));
	}

	get paginatedAssignments(): MonitoringAssignment[] {
		const startIndex = (this.worklistPage - 1) * this.worklistPageSize;
		return this.assignments.slice(startIndex, startIndex + this.worklistPageSize);
	}

	get worklistRangeStart(): number {
		if (!this.assignments.length) {
			return 0;
		}

		return (this.worklistPage - 1) * this.worklistPageSize + 1;
	}

	get worklistRangeEnd(): number {
		return Math.min(this.worklistPage * this.worklistPageSize, this.assignments.length);
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

	setViewMode(viewMode: MonitoringViewMode): void {
		if (this.viewMode === viewMode) {
			return;
		}

		this.viewMode = viewMode;

		if (viewMode === 'CALENDAR') {
			this.updateCalendarWindow();
		}

		this.loadMonitoring(false);
	}

	setCalendarHorizon(horizon: CalendarHorizon): void {
		if (this.calendarHorizon === horizon) {
			return;
		}

		this.calendarHorizon = horizon;
		this.updateCalendarWindow();
		this.loadMonitoring(false);
	}

	get calendarRangeLabel(): string {
		if (!this.calendarDays.length) {
			return '';
		}

		const start = this.calendarDays[0].date;
		const end = this.calendarDays[this.calendarDays.length - 1].date;
		const startLabel = start.toLocaleDateString('en-GB', {
			day: '2-digit',
			month: 'short',
			year:
				start.getFullYear() === end.getFullYear()
					? undefined
					: 'numeric',
		});
		const endLabel = end.toLocaleDateString('en-GB', {
			day: '2-digit',
			month: 'short',
			year: 'numeric',
		});

		return `${startLabel} - ${endLabel}`;
	}

	get calendarAgendaGroups(): CalendarAgendaGroup[] {
		const rangeStart = this.parseDate(this.calendarStartDate);
		const rangeEnd = this.parseDate(this.calendarEndDate);

		if (!rangeStart || !rangeEnd) {
			return [];
		}

		const groups = new Map<string, CalendarAgendaGroup>();

		this.assignments.forEach((assignment) => {
			const plannedStart = this.parseDate(assignment.plannedStartDate);
			const plannedEnd = this.parseDate(assignment.plannedEndDate);

			if (!plannedStart || !plannedEnd) {
				return;
			}

			let agendaDate = plannedStart;

			/*
			 * Assignment yang sudah mulai sebelum window Calendar tetap
			 * ditampilkan pada hari pertama window.
			 *
			 * Ini termasuk active overdue assignment yang planned schedule-nya
			 * sudah lewat, tetapi operasionalnya masih outstanding.
			 */
			if (agendaDate < rangeStart) {
				agendaDate = rangeStart;
			}

			if (agendaDate > rangeEnd) {
				return;
			}

			const key = this.toDateKey(agendaDate);
			const calendarDay = this.calendarDays.find(
				(day) => day.key === key,
			);

			if (!calendarDay) {
				return;
			}

			if (!groups.has(key)) {
				groups.set(key, {
					key,
					dayLabel: calendarDay.dayLabel,
					dateLabel: calendarDay.dateLabel,
					isToday: calendarDay.isToday,
					assignments: [],
				});
			}

			groups.get(key)?.assignments.push(assignment);
		});

		return Array.from(groups.values());
	}

	getCalendarBarStyle(
		assignment: MonitoringAssignment,
	): Record<string, string> {
		const start = this.parseDate(assignment.plannedStartDate);
		const end = this.parseDate(assignment.plannedEndDate);
		const rangeStart = this.parseDate(this.calendarStartDate);
		const rangeEnd = this.parseDate(this.calendarEndDate);

		if (!start || !end || !rangeStart || !rangeEnd) {
			return { display: 'none' };
		}

		let clippedStart = start < rangeStart ? rangeStart : start;
		let clippedEnd = end > rangeEnd ? rangeEnd : end;

		/*
		 * Active overdue assignment may have its entire planned schedule
		 * before the current calendar window.
		 *
		 * Keep it visible on the first calendar day instead of hiding it,
		 * because operationally the assignment is still outstanding.
		 */
		if (assignment.isOverdue && end < rangeStart) {
			clippedStart = rangeStart;
			clippedEnd = rangeStart;
		}

		if (
			clippedEnd < rangeStart ||
			clippedStart > rangeEnd ||
			clippedEnd < clippedStart
		) {
			return { display: 'none' };
		}

		const dayMs = 24 * 60 * 60 * 1000;
		const totalDays = this.calendarHorizon;
		const startOffset = Math.round(
			(clippedStart.getTime() - rangeStart.getTime()) / dayMs,
		);
		const duration =
			Math.round(
				(clippedEnd.getTime() - clippedStart.getTime()) / dayMs,
			) + 1;

		return {
			left: `${(startOffset / totalDays) * 100}%`,
			width: `${(duration / totalDays) * 100}%`,
		};
	}

	getCalendarTooltip(assignment: MonitoringAssignment): string {
		const start = this.parseDate(assignment.plannedStartDate);
		const end = this.parseDate(assignment.plannedEndDate);
		const formatter = new Intl.DateTimeFormat('en-GB', {
			day: '2-digit',
			month: 'short',
			year: 'numeric',
		});
		const schedule =
			start && end
				? `${formatter.format(start)} - ${formatter.format(end)}`
				: 'Schedule unavailable';

		return `${assignment.requestNo} · ${assignment.equipmentUnitName} · ${schedule}`;
	}

	getCalendarBarClass(assignment: MonitoringAssignment): string {
		if (
			assignment.slaStatus === 'OVERDUE' ||
			assignment.slaStatus === 'COMPLETED_LATE'
		) {
			return 'calendar-bar-overdue';
		}

		if (assignment.operationStatus === 'COMPLETED') {
			return 'calendar-bar-completed';
		}

		if (
			assignment.operationStatus === 'RUNNING' ||
			assignment.operationStatus === 'IN_OPERATION'
		) {
			return 'calendar-bar-running';
		}

		return 'calendar-bar-assigned';
	}

	getEquipmentIcon(icon?: string | null): string {
		const normalizedIcon = icon?.trim();

		if (!normalizedIcon || normalizedIcon.startsWith('fas ')) {
			return 'assets/icons/equipment/equipment.svg';
		}

		return `assets/icons/equipment/${normalizedIcon}`;
	}

	onSearchChange(value: string): void {
		this.worklistPage = 1;
		this.searchChange$.next(value || '');
	}

	onFilterChange(): void {
		this.worklistPage = 1;
		if (this.viewMode === 'CALENDAR') {
			this.updateCalendarWindow();
		}

		this.loadMonitoring(false);
	}

	refresh(): void {
		this.loadMonitoring();
	}

	resetFilters(): void {
		this.filters = this.createEmptyFilters();
		this.worklistPage = 1;

		if (this.viewMode === 'CALENDAR') {
			this.updateCalendarWindow();
		}

		this.loadMonitoring(false);
	}

	onCompanyChange(): void {
		this.worklistPage = 1;
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

	goToPreviousWorklistPage(): void {
		if (this.worklistPage <= 1) {
			return;
		}

		this.worklistPage -= 1;
	}

	goToNextWorklistPage(): void {
		if (this.worklistPage >= this.worklistTotalPages) {
			return;
		}

		this.worklistPage += 1;
	}

	trackByUuid(index: number, assignment: MonitoringAssignment): string {
		return assignment.uuid;
	}

	getOperationStatusLabel(status: string): string {
		const labels: Record<string, string> = {
			ASSIGNED: 'Scheduled',
			SCHEDULED: 'Scheduled',
			RUNNING: 'In Operation',
			IN_OPERATION: 'In Operation',
			COMPLETED: 'Completed',
		};

		return labels[status] || this.formatStatus(status);
	}

	getOperationStatusClass(status: string): string {
		const classes: Record<string, string> = {
			ASSIGNED: 'operation-assigned',
			SCHEDULED: 'operation-assigned',
			RUNNING: 'operation-running',
			IN_OPERATION: 'operation-running',
			COMPLETED: 'operation-completed',
		};

		return classes[status] || 'operation-default';
	}

	getOperationStatusIcon(status: string): string {
		const icons: Record<string, string> = {
			ASSIGNED: 'fa-calendar-check',
			SCHEDULED: 'fa-calendar-check',
			RUNNING: 'fa-play',
			IN_OPERATION: 'fa-play',
			COMPLETED: 'fa-check',
		};

		return icons[status] || 'fa-circle';
	}

	getSlaStatusLabel(status: string): string {
		const labels: Record<string, string> = {
			ASSIGNED: 'Scheduled',
			SCHEDULED: 'Scheduled',
			ON_SCHEDULE: 'On Schedule',
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
			SCHEDULED: 'sla-assigned',
			ON_SCHEDULE: 'sla-on-time',
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
					this.worklistPage = Math.min(this.worklistPage, this.worklistTotalPages);
					this.loadUnitImages(this.assignments);

					if (initializeOptions || this.assignments.length > 0) {
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

	getUnitImageUrl(unitUuid?: string | null): string | null {
		if (!unitUuid || this.unavailableUnitImages.has(unitUuid)) return null;
		return this.unitImageUrls.get(unitUuid) || null;
	}

	openUnitImagePreview(unitUuid?: string | null): void {
		if (!unitUuid || !this.getUnitImageUrl(unitUuid)) {
			return;
		}

		this.previewUnitUuid = unitUuid;
		const dialogRef = this.dialog.open(this.unitImagePreviewDialog, {
			width: '1040px',
			maxWidth: '94vw',
			maxHeight: '92vh',
			autoFocus: false,
			restoreFocus: true,
			panelClass: 'equipment-unit-image-preview-dialog',
		});

		this.unitImagePreviewDialogRef = dialogRef;
		dialogRef.afterClosed().subscribe(() => {
			if (this.unitImagePreviewDialogRef !== dialogRef) {
				return;
			}

			this.previewUnitUuid = null;
			this.unitImagePreviewDialogRef = null;
		});
	}

	closeUnitImagePreview(): void {
		this.unitImagePreviewDialogRef?.close();
	}

	get previewAssignment(): MonitoringAssignment | null {
		if (!this.previewUnitUuid) {
			return null;
		}

		return (
			this.assignments.find(
				(assignment) =>
					assignment.equipmentUnitUuid === this.previewUnitUuid,
			) || null
		);
	}

	get previewUnitImageUrl(): string | null {
		return this.previewUnitUuid
			? this.getUnitImageUrl(this.previewUnitUuid)
			: null;
	}

	private loadUnitImages(assignments: MonitoringAssignment[]): void {
		this.imageLoadVersion += 1;
		const currentVersion = this.imageLoadVersion;
		this.releaseUnitImages();
		this.unavailableUnitImages.clear();
		const unitUuids = Array.from(
			new Set(
				assignments
					.map((assignment) => assignment.equipmentUnitUuid)
					.filter((uuid): uuid is string => Boolean(uuid)),
			),
		);
		unitUuids.forEach((unitUuid) => {
			this.requestService
				.getUnitImage(unitUuid)
				.pipe(takeUntil(this.destroy$))
				.subscribe({
					next: (blob) => {
						if (currentVersion !== this.imageLoadVersion) return;
						this.unitImageUrls.set(
							unitUuid,
							URL.createObjectURL(blob),
						);
					},
					error: () => {
						if (currentVersion === this.imageLoadVersion)
							this.unavailableUnitImages.add(unitUuid);
					},
				});
		});
	}

	private releaseUnitImages(): void {
		this.unitImageUrls.forEach((url) => URL.revokeObjectURL(url));
		this.unitImageUrls.clear();
		this.previewUnitUuid = null;
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
		} else if (this.viewMode === 'CALENDAR') {
			params = params.set('endDate', this.calendarEndDate);
		}

		if (this.filters.overdueOnly) {
			params = params.set('overdueOnly', 'true');
		}

		return params;
	}

	private buildFilterOptions(assignments: MonitoringAssignment[]): void {
		const companies = new Map<string, CompanyOption>(
			this.companyOptions.map((company) => [company.uuid, company]),
		);
		const divisions = new Map<string, DivisionOption>(
			this.divisionOptions.map((division) => [division.uuid, division]),
		);
		const equipment = new Map<string, EquipmentOption>(
			this.equipmentOptions.map((item) => [item.uuid, item]),
		);

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

	private updateCalendarWindow(): void {
		const start = this.filters.startDate
			? this.parseDate(this.filters.startDate) || this.startOfToday()
			: this.startOfToday();
		const end = new Date(start);
		end.setDate(end.getDate() + this.calendarHorizon - 1);

		this.calendarStartDate = this.toDateKey(start);
		this.calendarEndDate = this.toDateKey(end);
		this.calendarDays = Array.from(
			{ length: this.calendarHorizon },
			(_, index) => {
				const date = new Date(start);
				date.setDate(start.getDate() + index);

				return {
					date,
					key: this.toDateKey(date),
					dayLabel: date.toLocaleDateString('en-GB', {
						weekday: 'short',
					}),
					dateLabel: date.toLocaleDateString('en-GB', {
						day: '2-digit',
						month: 'short',
					}),
					isToday:
						this.toDateKey(date) ===
						this.toDateKey(this.startOfToday()),
				};
			},
		);
	}

	private startOfToday(): Date {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		return today;
	}

	private parseDate(value: string | null): Date | null {
		if (!value) {
			return null;
		}

		const datePart = value.slice(0, 10);
		const [year, month, day] = datePart.split('-').map(Number);

		if (!year || !month || !day) {
			return null;
		}

		return new Date(year, month - 1, day);
	}

	private toDateKey(date: Date): string {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');

		return `${year}-${month}-${day}`;
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
			waitingStart: 0,
			overdue: 0,
			onSchedule: 0,
			completedToday: 0,
			availableUnit: 0,
			maintenanceUnit: 0,
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
