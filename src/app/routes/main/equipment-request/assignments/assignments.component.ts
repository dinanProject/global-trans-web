import { Component, OnInit } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';

import {
	CategoryOption,
	RequestDetail,
	RequestMaster,
	RequestService,
	UnitOption,
} from '../request/request.service';
import {
	AssignmentPayload,
	AssignmentService,
	EquipmentAssignment,
	ReplacementPayload,
} from './assignment.service';
import { UtilityService } from 'src/app/shared/utility/utility.service';

interface AssignmentDetailView extends RequestDetail {
	categoryCode: string;
	categoryName: string;
	assignments: EquipmentAssignment[];
	activeCount: number;
	remainingQuantity: number;
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

	requests: RequestMaster[] = [];
	filteredRequests: RequestMaster[] = [];
	selectedRequest: RequestMaster | null = null;
	detailViews: AssignmentDetailView[] = [];
	categories: CategoryOption[] = [];
	units: UnitOption[] = [];

	search = '';
	statusFilter = '';
	loadingWorklist = false;
	loadingDetail = false;
	saving = false;
	errorMessage = '';
	successMessage = '';

	replacingAssignment: EquipmentAssignment | null = null;
	replacementForm: ReplacementPayload = this.emptyReplacementForm();

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

		forkJoin({
			requests: this.requestService.getRequests(),
			categories: this.requestService.getCategories(),
			units: this.requestService.getUnits(),
		}).subscribe({
			next: ({ requests, categories, units }) => {
				this.requests = (requests || []).filter((request) =>
					this.workflowStatuses.includes(request.status),
				);
				this.categories = categories || [];
				this.units = units || [];
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
				!this.statusFilter || request.status === this.statusFilter;
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
		this.closeForms();
		this.loadSelectedRequest();
	}

	loadSelectedRequest(): void {
		if (!this.selectedRequest) {
			return;
		}

		const requestUuid = this.selectedRequest.uuid;
		this.clearMessages();
		this.loadingDetail = true;

		forkJoin({
			request: this.requestService.getRequest(requestUuid),
			assignments: this.assignmentService.getAssignments(requestUuid),
		}).subscribe({
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
	}

	openReplacement(assignment: EquipmentAssignment): void {
		if (!this.canReplace(assignment)) {
			return;
		}

		this.replacingAssignment = assignment;
		this.replacementForm = this.emptyReplacementForm();
		this.clearMessages();
	}

	closeForms(): void {
		this.replacingAssignment = null;
		this.replacementForm = this.emptyReplacementForm();
	}

	updateReplacementField(
		field: keyof ReplacementPayload,
		value: string,
	): void {
		this.replacementForm = { ...this.replacementForm, [field]: value };
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

		const requests = pendingDetails.map((detail) => {
			const unit = this.approvedUnit(detail)!;

			const payload: AssignmentPayload = {
				requestDetailUuid: detail.uuid || '',
				equipmentUnitUuid: unit.uuid,
				plannedStartDate: this.toDateOnly(
					this.selectedRequest!.startDate,
				),
				plannedEndDate: this.toDateOnly(this.selectedRequest!.endDate),
				notes: detail.remarks || null,
			};

			return this.assignmentService.createAssignment(
				this.selectedRequest!.uuid,
				payload,
			);
		});

		this.runAction(
			forkJoin(requests),
			'Seluruh equipment unit berhasil di-assign.',
		);
	}

	replaceAssignment(): void {
		if (!this.selectedRequest || !this.replacingAssignment) {
			return;
		}

		if (
			!this.replacementForm.equipmentUnitUuid ||
			!this.replacementForm.replacementReason
		) {
			this.errorMessage =
				'Equipment unit pengganti dan alasan penggantian wajib diisi.';
			return;
		}

		this.runAction(
			this.assignmentService.replaceAssignment(
				this.selectedRequest.uuid,
				this.replacingAssignment.uuid,
				this.replacementForm,
			),
			'Equipment assignment berhasil diganti.',
		);
	}

	completeAssignment(assignment: EquipmentAssignment): void {
		if (
			!this.selectedRequest ||
			!window.confirm('Tandai operasi equipment ini sebagai selesai?')
		) {
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

		const requests = assignments.map((assignment) =>
			this.assignmentService.startOperation(
				this.selectedRequest!.uuid,
				assignment.uuid,
			),
		);

		this.runAction(
			forkJoin(requests),
			'Seluruh equipment unit berhasil mulai beroperasi.',
		);
	}

	get requestStatus(): string {
		return this.selectedRequest?.status || '';
	}

	get totalRequested(): number {
		return this.detailViews.reduce(
			(total, detail) => total + Number(detail.quantity || 0),
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
				detail.remainingQuantity > 0 &&
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
			detail.remainingQuantity > 0 &&
			detail.activeCount === 0 &&
			!this.saving
		);
	}

	canReplace(assignment: EquipmentAssignment): boolean {
		return (
			[this.STATUS_ASSIGNED, this.STATUS_IN_PROGRESS].includes(
				this.requestStatus,
			) &&
			![
				this.ASSIGNMENT_STATUS_COMPLETED,
				this.ASSIGNMENT_STATUS_REPLACED,
				this.ASSIGNMENT_STATUS_CANCELLED,
			].includes(assignment.statusCode) &&
			!this.saving
		);
	}

	canComplete(assignment: EquipmentAssignment): boolean {
		return (
			this.requestStatus === this.STATUS_IN_PROGRESS &&
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
		const currentIndex = this.workflowStatuses.indexOf(this.requestStatus);
		const statusIndex = this.workflowStatuses.indexOf(status);
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
			const category = this.categories.find(
				(item) => item.id === detail.equipmentCategoryId,
			);

			return {
				...detail,
				categoryCode: category?.code || '',
				categoryName:
					category?.name || `Category #${detail.equipmentCategoryId}`,
				assignments: detailAssignments,
				activeCount,
				remainingQuantity: Math.max(
					Number(detail.quantity || 0) - activeCount,
					0,
				),
			};
		});
	}

	private toDateOnly(value: string | Date): string {
		if (typeof value === 'string') {
			return value.slice(0, 10);
		}

		const year = value.getFullYear();
		const month = String(value.getMonth() + 1).padStart(2, '0');
		const day = String(value.getDate()).padStart(2, '0');

		return `${year}-${month}-${day}`;
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

				this.closeForms();
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

	private emptyReplacementForm(): ReplacementPayload {
		return {
			equipmentUnitUuid: '',
			replacementReason: '',
			notes: null,
		};
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

			case this.STATUS_COMPLETED:
				return 'Seluruh unit telah menyelesaikan operasi.';

			default:
				return 'Informasi unit equipment request.';
		}
	}
}
