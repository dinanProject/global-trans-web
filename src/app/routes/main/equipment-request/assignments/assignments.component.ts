import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import {
	RequestDetail,
	RequestMaster,
	RequestService,
	UnitOption,
} from '../request/request.service';
import {
	AssignmentPayload,
	AssignmentService,
	EquipmentAssignment,
} from './assignment.service';
import { UtilityService } from 'src/app/shared/utility/utility.service';

interface AssignmentDetailView extends RequestDetail {
	categoryCode: string;
	categoryName: string;
	assignments: EquipmentAssignment[];
	activeCount: number;
}

@Component({
	selector: 'app-equipment-request-assignments',
	templateUrl: './assignments.component.html',
	styleUrls: ['./assignments.component.scss'],
	standalone: false,
})
export class AssignmentsComponent implements OnInit {
	readonly STATUS_APPROVED = 'APPROVED';
	readonly STATUS_ASSIGNED = 'ASSIGNED';
	readonly STATUS_IN_PROGRESS = 'IN_PROGRESS';
	readonly STATUS_PARTIALLY_COMPLETED = 'PARTIALLY_COMPLETED';
	readonly STATUS_COMPLETED = 'COMPLETED';

	readonly ASSIGNMENT_STATUS_ASSIGNED = 'ASSIGNED';
	readonly ASSIGNMENT_STATUS_IN_OPERATION = 'IN_OPERATION';
	readonly ASSIGNMENT_STATUS_COMPLETED = 'COMPLETED';
	readonly ASSIGNMENT_STATUS_REPLACED = 'REPLACED';
	readonly ASSIGNMENT_STATUS_CANCELLED = 'CANCELLED';

	readonly workflowStatuses = [
		this.STATUS_APPROVED,
		this.STATUS_ASSIGNED,
		this.STATUS_IN_PROGRESS,
		this.STATUS_COMPLETED,
	];

	readonly multiUnitWorkflowStatuses = [
		this.STATUS_APPROVED,
		this.STATUS_ASSIGNED,
		this.STATUS_IN_PROGRESS,
		this.STATUS_PARTIALLY_COMPLETED,
		this.STATUS_COMPLETED,
	];

	readonly worklistStatuses = [
		...this.workflowStatuses,
		this.STATUS_PARTIALLY_COMPLETED,
	];

	requests: RequestMaster[] = [];
	filteredRequests: RequestMaster[] = [];
	selectedRequest: RequestMaster | null = null;
	detailViews: AssignmentDetailView[] = [];
	units: UnitOption[] = [];

	search = '';
	statusFilter = '';
	loadingWorklist = false;
	loadingDetail = false;
	saving = false;
	errorMessage = '';
	successMessage = '';

	constructor(
		private readonly requestService: RequestService,
		private readonly assignmentService: AssignmentService,
		private readonly utilityService: UtilityService,
	) {}

	ngOnInit(): void {
		this.loadWorklist();
	}

	loadWorklist(keepSelection = true): void {
		this.clearMessages();
		this.loadingWorklist = true;

		this.requestService.getRequests().subscribe({
			next: (requests) => {
				this.requests = (requests || []).filter((request) =>
					this.worklistStatuses.includes(request.status),
				);

				this.applyFilters();
				this.loadingWorklist = false;

				if (keepSelection && this.selectedRequest) {
					const selected = this.requests.find(
						(request) =>
							request.uuid === this.selectedRequest?.uuid,
					);

					if (selected) {
						this.selectRequest(selected);
						return;
					}
				}

				if (!this.selectedRequest && this.filteredRequests.length > 0) {
					this.selectRequest(this.filteredRequests[0]);
				}
			},
			error: (error) => {
				this.loadingWorklist = false;
				this.errorMessage = this.getErrorMessage(
					error,
					'Gagal memuat worklist assignment.',
				);
			},
		});
	}

	applyFilters(): void {
		const keyword = this.search.trim().toLowerCase();
		this.filteredRequests = this.requests.filter((request) => {
			const matchesStatus =
				this.statusFilter === 'ALL'
					? true
					: this.statusFilter
						? request.status === this.statusFilter
						: request.status !== this.STATUS_COMPLETED;
			const searchable = [
				request.requestNo,
				request.companyCode,
				request.companyName,
				request.divisionCode,
				request.divisionName,
				request.requestByName,
				request.purpose,
			]
				.filter((value) => Boolean(value))
				.join(' ')
				.toLowerCase();

			return matchesStatus && (!keyword || searchable.includes(keyword));
		});
	}

	updateSearch(value: string): void {
		this.search = value;
		this.applyFilters();
	}

	updateStatusFilter(value: string): void {
		this.statusFilter = value;
		this.applyFilters();
	}

	selectRequest(request: RequestMaster): void {
		if (this.loadingDetail || this.saving) {
			return;
		}

		this.selectedRequest = request;
		this.loadSelectedRequest();
	}

	private loadUnitsForDetail(callback: () => void): void {
		if (this.units.length > 0) {
			callback();
			return;
		}

		this.requestService.getUnits().subscribe({
			next: (units) => {
				this.units = units || [];
				callback();
			},
			error: (error) => {
				this.loadingDetail = false;
				this.errorMessage = this.getErrorMessage(
					error,
					'Gagal memuat equipment unit.',
				);
			},
		});
	}

	loadSelectedRequest(): void {
		if (!this.selectedRequest) {
			return;
		}

		const requestUuid = this.selectedRequest.uuid;
		this.clearMessages();
		this.loadingDetail = true;

		this.loadUnitsForDetail(() => {
			this.assignmentService.getWorkspace(requestUuid).subscribe({
				next: ({ request, assignments }) => {
					this.selectedRequest = request;

					this.detailViews = this.buildDetailViews(
						request.details || [],
						assignments || [],
					);

					this.loadingDetail = false;
				},
				error: (error) => {
					this.loadingDetail = false;
					this.errorMessage = this.getErrorMessage(
						error,
						'Gagal memuat detail assignment.',
					);
				},
			});
		});
	}

	async assignAllEquipment(): Promise<void> {
		if (!this.selectedRequest || !this.canAssignAll) {
			return;
		}

		const pendingDetails = this.pendingAssignableDetails;

		const confirmed = await this.utilityService.confirm(
			'Assign Equipment',
			`Assign ${pendingDetails.length} equipment unit yang sudah disetujui?`,
			'warning',
		);

		if (!confirmed) {
			return;
		}

		const assignments: AssignmentPayload[] = pendingDetails.map(
			(detail) => {
				const unit = this.approvedUnit(detail)!;

				return {
					requestDetailUuid: detail.uuid || '',
					equipmentUnitUuid: unit.uuid,
					plannedStartDate: this.toDateTimeValue(
						this.selectedRequest!.startDate,
					),
					plannedEndDate: this.toDateTimeValue(
						this.selectedRequest!.endDate,
					),
					notes: detail.remarks || null,
				};
			},
		);

		this.runAction(
			this.assignmentService.createAssignments(
				this.selectedRequest.uuid,
				assignments,
			),
			'Seluruh equipment unit berhasil di-assign.',
		);
	}

	async completeAssignment(assignment: EquipmentAssignment): Promise<void> {
		if (!this.selectedRequest || !this.canComplete(assignment)) {
			return;
		}
		const confirmed = await this.utilityService.confirm(
			'Complete Operation',
			'Tandai operasi equipment ini sebagai selesai?',
			'warning',
		);

		if (!confirmed) {
			return;
		}

		this.runAction(
			this.assignmentService.completeAssignment(
				this.selectedRequest.uuid,
				assignment.uuid,
			),
			'Operasi equipment berhasil diselesaikan.',
		);
	}

	async startAllOperations(): Promise<void> {
		if (!this.selectedRequest || !this.canStartAll) {
			return;
		}

		const assignments = this.pendingStartAssignments;

		const confirmed = await this.utilityService.confirm(
			'Start Operation',
			`Mulai operasi untuk ${assignments.length} equipment unit?`,
			'warning',
		);

		if (!confirmed) {
			return;
		}

		const assignmentUuids = assignments.map(
			(assignment) => assignment.uuid,
		);

		this.runAction(
			this.assignmentService.startOperations(
				this.selectedRequest.uuid,
				assignmentUuids,
			),
			'Seluruh equipment unit berhasil mulai beroperasi.',
		);
	}

	get requestStatus(): string {
		return this.selectedRequest?.status || '';
	}

	get visibleWorkflowStatuses(): string[] {
		return this.totalRequested > 1 ||
			this.requestStatus === this.STATUS_PARTIALLY_COMPLETED
			? this.multiUnitWorkflowStatuses
			: this.workflowStatuses;
	}

	get totalRequested(): number {
		return this.detailViews.length;
	}

	get totalCompleted(): number {
		return this.detailViews.reduce(
			(total, detail) =>
				total +
				detail.assignments.filter(
					(assignment) =>
						assignment.statusCode ===
						this.ASSIGNMENT_STATUS_COMPLETED,
				).length,
			0,
		);
	}

	get totalActiveAssigned(): number {
		return this.detailViews.reduce(
			(total, detail) => total + detail.activeCount,
			0,
		);
	}

	get pendingAssignableDetails(): AssignmentDetailView[] {
		return this.detailViews.filter(
			(detail) =>
				Boolean(detail.uuid) &&
				Boolean(this.approvedUnit(detail)) &&
				detail.activeCount === 0,
		);
	}

	get pendingStartAssignments(): EquipmentAssignment[] {
		return this.detailViews.reduce<EquipmentAssignment[]>(
			(result, detail) =>
				result.concat(
					detail.assignments.filter(
						(assignment) =>
							assignment.statusCode ===
							this.ASSIGNMENT_STATUS_ASSIGNED,
					),
				),
			[],
		);
	}

	get canStartAll(): boolean {
		return (
			this.requestStatus === this.STATUS_ASSIGNED &&
			this.pendingStartAssignments.length > 0 &&
			!this.saving
		);
	}

	get canAssignAll(): boolean {
		return (
			this.requestStatus === this.STATUS_APPROVED &&
			Boolean(this.selectedRequest?.approvalLocked) &&
			this.pendingAssignableDetails.length > 0 &&
			!this.saving
		);
	}

	getEquipmentIcon(code?: string): string {
		const fileByCode: Record<string, string> = {
			FORKLIFT: 'forklift.svg',
			MANLIFT: 'manlift.svg',
			TELEHANDLER: 'telehandler.svg',
			CRANE: 'crane.svg',
			SERVICE_TRUCK: 'service-truck.svg',
			TRUCK_MOUNTED_CRANE: 'truck-mounted-crane.svg',
			SKYLIFT: 'skylift.svg',
			FLATBED: 'flatbed.svg',
			TRAILER: 'trailer.svg',
			TES: 'tes.svg',
		};

		const fileName =
			fileByCode[(code || '').toUpperCase()] || 'equipment.svg';

		return `assets/icons/equipment/${fileName}`;
	}

	canAssignDetail(detail: AssignmentDetailView): boolean {
		return (
			this.requestStatus === this.STATUS_APPROVED &&
			Boolean(this.selectedRequest?.approvalLocked) &&
			Boolean(this.approvedUnit(detail)) &&
			detail.activeCount === 0 &&
			!this.saving
		);
	}

	canComplete(assignment: EquipmentAssignment): boolean {
		return (
			[this.STATUS_IN_PROGRESS, this.STATUS_PARTIALLY_COMPLETED].includes(
				this.requestStatus,
			) &&
			assignment.statusCode === this.ASSIGNMENT_STATUS_IN_OPERATION &&
			!this.saving
		);
	}

	availableUnits(categoryId: number, currentUnitUuid?: string): UnitOption[] {
		const allAssignments = this.detailViews.reduce<EquipmentAssignment[]>(
			(result, detail) => result.concat(detail.assignments),
			[],
		);
		const used = new Set(
			allAssignments
				.filter(
					(assignment) =>
						![
							this.ASSIGNMENT_STATUS_COMPLETED,
							this.ASSIGNMENT_STATUS_REPLACED,
							this.ASSIGNMENT_STATUS_CANCELLED,
						].includes(assignment.statusCode),
				)
				.map((assignment) => assignment.equipmentUnitUuid),
		);

		return this.units.filter(
			(unit) =>
				unit.categoryId === categoryId &&
				(unit.uuid === currentUnitUuid || !used.has(unit.uuid)),
		);
	}

	approvedUnit(detail: AssignmentDetailView): UnitOption | null {
		if (!detail.equipmentUnitId) {
			return null;
		}

		return (
			this.units.find((unit) => unit.id === detail.equipmentUnitId) ||
			null
		);
	}

	categoryIdForAssignment(assignment: EquipmentAssignment): number {
		const detail = this.detailViews.find(
			(item) => item.uuid === assignment.requestDetailUuid,
		);
		return Number(detail?.equipmentCategoryId || 0);
	}

	unitLabel(uuid: string): string {
		const unit = this.units.find((item) => item.uuid === uuid);
		return unit ? `${unit.unitCode} - ${unit.unitName}` : uuid;
	}

	statusLabel(status: string): string {
		return (
			(
				{
					APPROVED: 'Approved',
					ASSIGNED: 'Assigned',
					IN_PROGRESS: 'In Progress',
					PARTIALLY_COMPLETED: 'Partially Completed',
					IN_OPERATION: 'In Operation',
					COMPLETED: 'Completed',
					REPLACED: 'Replaced',
					CANCELLED: 'Cancelled',
					REJECTED: 'Rejected',
				} as Record<string, string>
			)[status] || status
		);
	}

	statusClass(status: string): string {
		return `status-${String(status || '')
			.toLowerCase()
			.replace(/_/g, '-')}`;
	}

	formatDateTime(value?: string | null): string {
		if (!value) {
			return '-';
		}
		const date = new Date(value);
		if (Number.isNaN(date.getTime())) {
			return value;
		}
		return new Intl.DateTimeFormat('id-ID', {
			day: '2-digit',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			hour12: false,
		}).format(date);
	}

	formatDate(value?: string | null): string {
		if (!value) {
			return '-';
		}
		const date = new Date(value);
		if (Number.isNaN(date.getTime())) {
			return value;
		}
		return new Intl.DateTimeFormat('id-ID', {
			day: '2-digit',
			month: 'short',
			year: 'numeric',
		}).format(date);
	}

	isWorkflowStatusActive(status: string): boolean {
		const currentIndex = this.visibleWorkflowStatuses.indexOf(
			this.requestStatus,
		);
		const statusIndex = this.visibleWorkflowStatuses.indexOf(status);
		return currentIndex >= 0 && statusIndex <= currentIndex;
	}

	isWorkflowStatusCurrent(status: string): boolean {
		return this.requestStatus === status;
	}

	trackByRequestUuid(_index: number, request: RequestMaster): string {
		return request.uuid;
	}

	trackByAssignmentUuid(
		_index: number,
		assignment: EquipmentAssignment,
	): string {
		return assignment.uuid;
	}

	private buildDetailViews(
		details: RequestDetail[],
		assignments: EquipmentAssignment[],
	): AssignmentDetailView[] {
		return details.map((detail) => {
			const detailAssignments = assignments.filter(
				(assignment) => assignment.requestDetailUuid === detail.uuid,
			);
			const activeCount = detailAssignments.filter(
				(assignment) =>
					![
						this.ASSIGNMENT_STATUS_REPLACED,
						this.ASSIGNMENT_STATUS_CANCELLED,
					].includes(assignment.statusCode),
			).length;

			return {
				...detail,
				categoryCode: detail.equipmentCategoryCode || '',
				categoryName:
					detail.equipmentCategoryName ||
					`Category #${detail.equipmentCategoryId}`,
				assignments: detailAssignments,
				activeCount,
			};
		});
	}

	private toDateTimeValue(value: string | Date): string {
		if (typeof value === 'string') {
			const normalizedValue = value.trim();

			const match = normalizedValue.match(
				/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/,
			);

			if (match) {
				const [, year, month, day, hour, minute, second = '00'] = match;

				return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
			}
		}

		const date = value instanceof Date ? value : new Date(value);

		if (Number.isNaN(date.getTime())) {
			return '';
		}

		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		const hour = String(date.getHours()).padStart(2, '0');
		const minute = String(date.getMinutes()).padStart(2, '0');
		const second = String(date.getSeconds()).padStart(2, '0');

		return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
	}

	private runAction(
		request$: Observable<unknown>,
		successMessage: string,
	): void {
		this.clearMessages();
		this.saving = true;

		request$.subscribe({
			next: () => {
				this.saving = false;
				this.successMessage = successMessage;
				this.utilityService.alert('Success', successMessage, 'success');

				this.loadWorklist(true);
			},
			error: (error) => {
				this.saving = false;
				this.errorMessage = this.getErrorMessage(
					error,
					'Gagal memproses assignment.',
				);
			},
		});
	}

	private clearMessages(): void {
		this.errorMessage = '';
		this.successMessage = '';
	}

	private getErrorMessage(error: any, fallback: string): string {
		return error?.error?.message || error?.message || fallback;
	}

	get requestDetailSubtitle(): string {
		switch (this.requestStatus) {
			case this.STATUS_APPROVED:
				return 'Periksa unit yang telah disetujui sebelum melanjutkan penugasan.';

			case this.STATUS_ASSIGNED:
				return 'Seluruh unit telah ditugaskan dan siap memulai operasi.';

			case this.STATUS_IN_PROGRESS:
				return 'Seluruh unit sedang beroperasi.';

			case this.STATUS_PARTIALLY_COMPLETED:
				return 'Sebagian unit telah selesai dan unit lainnya masih beroperasi.';

			case this.STATUS_COMPLETED:
				return 'Seluruh unit telah menyelesaikan operasi.';

			default:
				return 'Informasi unit equipment request.';
		}
	}
}
