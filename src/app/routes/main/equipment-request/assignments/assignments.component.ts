import { Component, OnInit } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';

import {
	CategoryOption,
	RequestDetail,
	RequestMaster,
	RequestService,
	UnitOption,
} from '../request/request.service'; // sesuaikan path bila RequestService berada di folder lain
import {
	AssignmentPayload,
	AssignmentService,
	EquipmentAssignment,
	ReplacementPayload,
} from './assignment.service';

interface AssignmentDetailView extends RequestDetail {
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

	selectedDetail: AssignmentDetailView | null = null;
	replacingAssignment: EquipmentAssignment | null = null;
	assignmentForm: AssignmentPayload = this.emptyAssignmentForm();
	replacementForm: ReplacementPayload = this.emptyReplacementForm();

	constructor(
		private readonly requestService: RequestService,
		private readonly assignmentService: AssignmentService,
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
						(request) => request.uuid === this.selectedRequest?.uuid,
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

	openAssignment(detail: AssignmentDetailView): void {
		if (!this.canAssignDetail(detail)) {
			return;
		}

		this.selectedDetail = detail;
		this.replacingAssignment = null;
		this.assignmentForm = {
			...this.emptyAssignmentForm(),
			requestDetailUuid: detail.uuid || '',
			plannedStartDate: this.selectedRequest?.startDate || '',
			plannedEndDate: this.selectedRequest?.endDate || '',
		};
		this.clearMessages();
	}

	openReplacement(assignment: EquipmentAssignment): void {
		if (!this.canReplace(assignment)) {
			return;
		}

		this.replacingAssignment = assignment;
		this.selectedDetail = null;
		this.replacementForm = this.emptyReplacementForm();
		this.clearMessages();
	}

	closeForms(): void {
		this.selectedDetail = null;
		this.replacingAssignment = null;
		this.assignmentForm = this.emptyAssignmentForm();
		this.replacementForm = this.emptyReplacementForm();
	}

	updateAssignmentField(field: keyof AssignmentPayload, value: string): void {
		this.assignmentForm = { ...this.assignmentForm, [field]: value };
	}

	updateReplacementField(field: keyof ReplacementPayload, value: string): void {
		this.replacementForm = { ...this.replacementForm, [field]: value };
	}

	createAssignment(): void {
		if (!this.selectedRequest || !this.selectedDetail) {
			return;
		}

		if (!this.canAssignDetail(this.selectedDetail)) {
			this.errorMessage =
				'Detail sudah terpenuhi atau request tidak berstatus APPROVED.';
			return;
		}

		if (
			!this.assignmentForm.equipmentUnitUuid ||
			!this.assignmentForm.plannedStartDate ||
			!this.assignmentForm.plannedEndDate
		) {
			this.errorMessage = 'Equipment unit dan periode assignment wajib diisi.';
			return;
		}

		this.runAction(
			this.assignmentService.createAssignment(
				this.selectedRequest.uuid,
				this.assignmentForm,
			),
			'Equipment unit berhasil di-assign.',
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

	startOperation(assignment: EquipmentAssignment): void {
		if (!this.selectedRequest || !window.confirm('Mulai operasi equipment ini?')) {
			return;
		}

		this.runAction(
			this.assignmentService.startOperation(
				this.selectedRequest.uuid,
				assignment.uuid,
			),
			'Operasi equipment berhasil dimulai.',
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

	canAssignDetail(detail: AssignmentDetailView): boolean {
		return (
			this.requestStatus === this.STATUS_APPROVED &&
			Boolean(this.selectedRequest?.approvalLocked) &&
			detail.remainingQuantity > 0 &&
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

	canStart(assignment: EquipmentAssignment): boolean {
		return (
			[this.STATUS_ASSIGNED, this.STATUS_IN_PROGRESS].includes(
				this.requestStatus,
			) &&
			assignment.statusCode === this.ASSIGNMENT_STATUS_ASSIGNED &&
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
			({
				APPROVED: 'Approved',
				ASSIGNED: 'Assigned',
				IN_PROGRESS: 'In Progress',
				IN_OPERATION: 'In Operation',
				COMPLETED: 'Completed',
				REPLACED: 'Replaced',
				CANCELLED: 'Cancelled',
				REJECTED: 'Rejected',
			} as Record<string, string>)[status] || status
		);
	}

	statusClass(status: string): string {
		return `status-${String(status || '').toLowerCase().replace(/_/g, '-')}`;
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
				categoryName: category?.name || `Category #${detail.equipmentCategoryId}`,
				assignments: detailAssignments,
				activeCount,
				remainingQuantity: Math.max(
					Number(detail.quantity || 0) - activeCount,
					0,
				),
			};
		});
	}

	private runAction(
		request$: Observable<EquipmentAssignment>,
		successMessage: string,
	): void {
		this.clearMessages();
		this.saving = true;

		request$.subscribe({
			next: () => {
				this.saving = false;
				this.successMessage = successMessage;
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

	private emptyAssignmentForm(): AssignmentPayload {
		return {
			requestDetailUuid: '',
			equipmentUnitUuid: '',
			plannedStartDate: '',
			plannedEndDate: '',
			notes: null,
		};
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
		return (
			error?.error?.message ||
			error?.message ||
			fallback
		);
	}
}
