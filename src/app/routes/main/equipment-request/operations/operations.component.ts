import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject, takeUntil } from 'rxjs';

import {
	RequestAttachment,
	RequestDetail,
	RequestMaster,
	RequestService,
	UnitOption,
} from '../request/request.service';
import {
	OperationsService,
	EquipmentOperation,
} from './operations.service';
import { UtilityService } from 'src/app/shared/utility/utility.service';
import { Menu } from 'src/app/core/models/menu.model';
import { MainService } from '../../main.service';

interface OperationDetailView extends RequestDetail {
	categoryCode: string;
	categoryName: string;
	operations: EquipmentOperation[];
	activeCount: number;
}

@Component({
	selector: 'app-equipment-request-operations',
	templateUrl: './operations.component.html',
	styleUrls: ['./operations.component.scss'],
	standalone: false,
})
export class OperationsComponent implements OnInit, OnDestroy {
	@ViewChild('unitImagePreviewDialog')
	private unitImagePreviewDialog!: TemplateRef<unknown>;
	private unitImagePreviewDialogRef: MatDialogRef<unknown> | null = null;
	private readonly destroy$ = new Subject<void>();
	private operationUnreadCount: number | null = null;
	private operationMenuCode: string | null = null;
	private operationUnreadReferences = new Set<string>();
	private pendingWorklistRefresh = false;
	private targetReferenceUuid: string | null = null;
	readonly STATUS_APPROVED = 'APPROVED';
	readonly STATUS_ASSIGNED = 'ASSIGNED';
	readonly STATUS_IN_PROGRESS = 'IN_PROGRESS';
	readonly STATUS_PARTIALLY_COMPLETED = 'PARTIALLY_COMPLETED';
	readonly STATUS_COMPLETED = 'COMPLETED';

	readonly OPERATION_RECORD_STATUS_ASSIGNED = 'ASSIGNED';
	readonly OPERATION_RECORD_STATUS_IN_OPERATION = 'IN_OPERATION';
	readonly OPERATION_RECORD_STATUS_COMPLETED = 'COMPLETED';
	readonly OPERATION_RECORD_STATUS_REPLACED = 'REPLACED';
	readonly OPERATION_RECORD_STATUS_CANCELLED = 'CANCELLED';

	readonly OPERATION_STATUS_SCHEDULED = 'SCHEDULED';
	readonly OPERATION_STATUS_STARTING_SOON = 'STARTING_SOON';
	readonly OPERATION_STATUS_IN_OPERATION = 'IN_OPERATION';
	readonly OPERATION_STATUS_ATTENTION = 'ATTENTION';
	readonly OPERATION_STATUS_COMPLETED = 'COMPLETED';
	readonly operationStatuses = [
		this.OPERATION_STATUS_SCHEDULED,
		this.OPERATION_STATUS_STARTING_SOON,
		this.OPERATION_STATUS_IN_OPERATION,
		this.OPERATION_STATUS_ATTENTION,
		this.OPERATION_STATUS_COMPLETED,
	];
	readonly startingSoonDays = 3;

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
	readonly pageSize = 4;
	currentPage = 1;
	selectedRequest: RequestMaster | null = null;
	detailViews: OperationDetailView[] = [];
	units: UnitOption[] = [];
	readonly unitImageUrls = new Map<string, string>();
	previewUnitUuid: string | null = null;
	attachments: RequestAttachment[] = [];
	loadingAttachments = false;
	private readonly unavailableUnitImages = new Set<string>();
	private imageLoadVersion = 0;

	search = '';
	statusFilter = '';
	loadingWorklist = false;
	loadingDetail = false;
	saving = false;
	errorMessage = '';
	successMessage = '';

	constructor(
		private readonly activatedRoute: ActivatedRoute,
		private readonly requestService: RequestService,
		private readonly operationsService: OperationsService,
		private readonly utilityService: UtilityService,
		private readonly mainService: MainService,
		private readonly dialog: MatDialog,
	) {}

	ngOnInit(): void {
		this.activatedRoute.queryParamMap
			.pipe(takeUntil(this.destroy$))
			.subscribe((params) => {
				this.targetReferenceUuid = params.get('referenceUuid');
				this.trySelectTargetRequest();
			});

		this.mainService.menus$
			.pipe(takeUntil(this.destroy$))
			.subscribe((menus) => this.handleMenuUnreadChange(menus ?? []));

		this.loadWorklist();
	}

	ngOnDestroy(): void {
		this.unitImagePreviewDialogRef?.close();
		this.imageLoadVersion += 1;
		this.releaseUnitImages();
		this.destroy$.next();
		this.destroy$.complete();
	}

	loadWorklist(keepSelection = true): void {
		if (this.loadingWorklist) {
			this.pendingWorklistRefresh = true;
			return;
		}

		this.clearMessages();
		this.loadingWorklist = true;

		this.requestService
			.getRequests()
			.pipe(takeUntil(this.destroy$))
			.subscribe({
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
						}
					}

					this.trySelectTargetRequest();

					if (
						!this.selectedRequest &&
						this.filteredRequests.length > 0
					) {
						this.selectRequest(this.paginatedRequests[0]);
					}

					this.runPendingWorklistRefresh();
				},
				error: (error) => {
					this.loadingWorklist = false;
					this.errorMessage = this.getErrorMessage(
						error,
						'Gagal memuat operations worklist.',
					);

					this.runPendingWorklistRefresh();
				},
			});
	}

	private trySelectTargetRequest(): void {
		if (
			!this.targetReferenceUuid ||
			this.loadingWorklist ||
			this.loadingDetail ||
			this.saving
		) {
			return;
		}

		const targetRequest = this.requests.find(
			(request) => request.uuid === this.targetReferenceUuid,
		);

		if (!targetRequest) {
			return;
		}

		this.targetReferenceUuid = null;

		const targetIndex = this.filteredRequests.findIndex(
			(request) => request.uuid === targetRequest.uuid,
		);
		if (targetIndex >= 0) {
			this.currentPage = Math.floor(targetIndex / this.pageSize) + 1;
		}

		if (this.selectedRequest?.uuid === targetRequest.uuid) {
			return;
		}

		this.selectRequest(targetRequest);
	}

	private runPendingWorklistRefresh(): void {
		if (!this.pendingWorklistRefresh) {
			return;
		}

		this.pendingWorklistRefresh = false;
		this.loadWorklist(true);
	}

	private handleMenuUnreadChange(menus: Menu[]): void {
		const operationMenu = this.findMenuByRoute(
			menus,
			'/equipment-request/operations',
		);
		this.operationMenuCode = operationMenu?.code ?? null;
		this.operationUnreadReferences = new Set(
			operationMenu?.unreadReferenceUuids ?? [],
		);
		const unreadCount = Number(operationMenu?.unreadCount ?? 0);

		if (this.operationUnreadCount === null) {
			this.operationUnreadCount = unreadCount;
			return;
		}

		const increased = unreadCount > this.operationUnreadCount;
		this.operationUnreadCount = unreadCount;

		if (increased) {
			this.loadWorklist(true);
		}
	}

	private getUnreadCountByRoute(menus: Menu[], route: string): number {
		const menu = this.findMenuByRoute(menus, route);

		return Number(menu?.unreadCount ?? 0);
	}

	private findMenuByRoute(menus: Menu[], route: string): Menu | null {
		for (const menu of menus) {
			if (this.normalizeRoute(menu.route) === route) {
				return menu;
			}

			const childMatch = this.findMenuByRoute(menu.child ?? [], route);

			if (childMatch) {
				return childMatch;
			}
		}

		return null;
	}

	private normalizeRoute(route: string | null | undefined): string | null {
		if (!route) {
			return null;
		}

		const normalized = route.trim().replace(/^\/main/, '');

		return normalized.startsWith('/') ? normalized : `/${normalized}`;
	}

	isRequestUnread(requestUuid: string): boolean {
		return this.operationUnreadReferences.has(requestUuid);
	}

	applyFilters(): void {
		const keyword = this.search.trim().toLowerCase();
		this.filteredRequests = this.requests
			.filter((request) => {
				const operationStatus = this.operationStatus(request);
				const matchesStatus =
					this.statusFilter === 'ALL'
						? true
						: this.statusFilter
							? operationStatus === this.statusFilter
							: operationStatus !==
								this.OPERATION_STATUS_COMPLETED;
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

				return (
					matchesStatus && (!keyword || searchable.includes(keyword))
				);
			})
			.sort((a, b) => this.compareOperationPriority(a, b));

		this.currentPage = Math.min(this.currentPage, this.totalPages);

		if (
			this.selectedRequest &&
			!this.filteredRequests.some(
				(request) => request.uuid === this.selectedRequest?.uuid,
			)
		) {
			this.selectedRequest = null;
			this.detailViews = [];
		}
	}

	get totalPages(): number {
		return Math.max(
			1,
			Math.ceil(this.filteredRequests.length / this.pageSize),
		);
	}

	get paginatedRequests(): RequestMaster[] {
		const startIndex = (this.currentPage - 1) * this.pageSize;
		return this.filteredRequests.slice(
			startIndex,
			startIndex + this.pageSize,
		);
	}

	get pageStartItem(): number {
		return this.filteredRequests.length === 0
			? 0
			: (this.currentPage - 1) * this.pageSize + 1;
	}

	get pageEndItem(): number {
		return Math.min(
			this.currentPage * this.pageSize,
			this.filteredRequests.length,
		);
	}

	goToPage(page: number): void {
		if (this.loadingDetail || this.saving) {
			return;
		}

		const nextPage = Math.min(Math.max(page, 1), this.totalPages);

		if (nextPage === this.currentPage) {
			return;
		}

		this.currentPage = nextPage;

		if (
			this.selectedRequest &&
			this.paginatedRequests.some(
				(request) => request.uuid === this.selectedRequest?.uuid,
			)
		) {
			return;
		}

		const firstRequest = this.paginatedRequests[0];
		if (firstRequest) {
			this.selectRequest(firstRequest);
		}
	}

	operationStatus(request: RequestMaster): string {
		if (request.status === this.STATUS_COMPLETED) {
			return this.OPERATION_STATUS_COMPLETED;
		}

		const now = Date.now();
		const start = new Date(request.startDate || '').getTime();
		const end = new Date(request.endDate || '').getTime();

		if (!Number.isFinite(start) || !Number.isFinite(end)) {
			return this.OPERATION_STATUS_SCHEDULED;
		}

		if (now < start) {
			const reminderWindowMs =
				this.startingSoonDays * 24 * 60 * 60 * 1000;
			return start - now <= reminderWindowMs
				? this.OPERATION_STATUS_STARTING_SOON
				: this.OPERATION_STATUS_SCHEDULED;
		}

		if (now <= end) {
			return this.OPERATION_STATUS_IN_OPERATION;
		}

		return this.OPERATION_STATUS_ATTENTION;
	}

	operationCount(status: string): number {
		return this.requests.filter(
			(request) => this.operationStatus(request) === status,
		).length;
	}

	get attentionCount(): number {
		return (
			this.operationCount(this.OPERATION_STATUS_STARTING_SOON) +
			this.operationCount(this.OPERATION_STATUS_IN_OPERATION) +
			this.operationCount(this.OPERATION_STATUS_ATTENTION)
		);
	}

	private compareOperationPriority(
		a: RequestMaster,
		b: RequestMaster,
	): number {
		const priority: Record<string, number> = {
			[this.OPERATION_STATUS_ATTENTION]: 0,
			[this.OPERATION_STATUS_IN_OPERATION]: 1,
			[this.OPERATION_STATUS_STARTING_SOON]: 2,
			[this.OPERATION_STATUS_SCHEDULED]: 3,
			[this.OPERATION_STATUS_COMPLETED]: 4,
		};
		const statusDiff =
			(priority[this.operationStatus(a)] ?? 99) -
			(priority[this.operationStatus(b)] ?? 99);

		if (statusDiff !== 0) {
			return statusDiff;
		}

		return (
			new Date(a.startDate || '').getTime() -
			new Date(b.startDate || '').getTime()
		);
	}

	updateSearch(value: string): void {
		this.search = value;
		this.currentPage = 1;
		this.applyFilters();
	}

	updateStatusFilter(value: string): void {
		this.statusFilter = value;
		this.currentPage = 1;
		this.applyFilters();
	}

	onRequestClicked(request: RequestMaster): void {
		if (this.loadingDetail || this.saving) {
			return;
		}

		this.markOperationNotificationAsRead(request.uuid);
		this.selectRequest(request);
	}

	private markOperationNotificationAsRead(requestUuid: string): void {
		this.mainService
			.markMenuNotificationAsRead(
				requestUuid,
				'EQUIPMENT_OPERATION.VIEW',
				this.operationMenuCode,
			)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: ({ updatedCount }) => {
					if (updatedCount > 0) {
						this.mainService.refreshMenuUnreadCounts();
					}
				},
				error: (error: unknown) => {
					console.error(
						'Failed to mark operation notification as read',
						error,
					);
				},
			});
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
				this.trySelectTargetRequest();
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
		this.attachments = [];
		this.loadAttachments(requestUuid);
		this.loadingDetail = true;

		this.loadUnitsForDetail(() => {
			this.operationsService.getWorkspace(requestUuid).subscribe({
				next: ({ request, operations }) => {
					this.selectedRequest = request;

					this.detailViews = this.buildDetailViews(
						request.details || [],
						operations || [],
					);
					this.loadUnitImages(request);

					this.loadingDetail = false;
					this.trySelectTargetRequest();
				},
				error: (error) => {
					this.loadingDetail = false;
					this.trySelectTargetRequest();
					this.errorMessage = this.getErrorMessage(
						error,
						'Gagal memuat detail operation.',
					);
				},
			});
		});
	}

	private loadAttachments(requestUuid: string): void {
		this.loadingAttachments = true;
		this.requestService
			.getAttachments(requestUuid)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (items) => {
					if (this.selectedRequest?.uuid === requestUuid) {
						this.attachments = items ?? [];
						this.loadingAttachments = false;
					}
				},
				error: () => {
					if (this.selectedRequest?.uuid === requestUuid) {
						this.attachments = [];
						this.loadingAttachments = false;
					}
				},
			});
	}

	openAttachment(attachment: RequestAttachment): void {
		if (!this.selectedRequest?.uuid) {
			return;
		}

		this.requestService
			.downloadAttachment(this.selectedRequest.uuid, attachment.uuid)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (blob) => {
					const url = URL.createObjectURL(blob);
					window.open(url, '_blank', 'noopener,noreferrer');
					setTimeout(() => URL.revokeObjectURL(url), 60000);
				},
				error: () =>
					this.utilityService.alert(
						'Failed',
						'Failed to open attachment.',
						'error',
					),
			});
	}

	formatAttachmentSize(bytes: number): string {
		if (bytes < 1024 * 1024) {
			return `${Math.max(1, Math.round(bytes / 1024))} KB`;
		}

		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	}

	async completeOperation(operation: EquipmentOperation): Promise<void> {
		if (!this.selectedRequest || !this.canComplete(operation)) {
			return;
		}

		const plannedEnd =
			operation.plannedEndDate || this.selectedRequest.endDate;

		const plannedEndTime = plannedEnd
			? new Date(plannedEnd).getTime()
			: NaN;

		const now = Date.now();

		let title = 'Complete Operation';
		let message = 'Tandai operasi equipment ini sebagai selesai?';

		if (Number.isFinite(plannedEndTime)) {
			if (now < plannedEndTime) {
				title = 'Early Completion';
				message =
					`Planned end masih ${this.formatDateTime(plannedEnd)}. ` +
					'Operation akan ditandai selesai lebih awal. Lanjutkan?';
			} else if (now > plannedEndTime) {
				message =
					`Operation sudah melewati planned end ` +
					`${this.formatDateTime(plannedEnd)}. ` +
					'Tandai operation sebagai selesai sekarang?';
			}
		}

		const confirmed = await this.utilityService.confirm(
			title,
			message,
			'warning',
		);

		if (!confirmed) {
			return;
		}

		this.runAction(
			this.operationsService.completeOperation(
				this.selectedRequest.uuid,
				operation.uuid,
			),
			'Operasi equipment berhasil diselesaikan.',
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
				detail.operations.filter(
					(operation) =>
						operation.statusCode ===
						this.OPERATION_RECORD_STATUS_COMPLETED,
				).length,
			0,
		);
	}

	get totalActiveOperations(): number {
		return this.detailViews.reduce(
			(total, detail) => total + detail.activeCount,
			0,
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

	canAssignDetail(detail: OperationDetailView): boolean {
		return (
			this.requestStatus === this.STATUS_APPROVED &&
			Boolean(this.selectedRequest?.approvalLocked) &&
			Boolean(this.approvedUnit(detail)) &&
			detail.activeCount === 0 &&
			!this.saving
		);
	}

	canComplete(operation: EquipmentOperation): boolean {
		if (!this.selectedRequest || this.saving) {
			return false;
		}

		const operationStatus = this.operationStatus(this.selectedRequest);
		return (
			[
				this.OPERATION_STATUS_IN_OPERATION,
				this.OPERATION_STATUS_ATTENTION,
			].includes(operationStatus) &&
			[
				this.OPERATION_RECORD_STATUS_ASSIGNED,
				this.OPERATION_RECORD_STATUS_IN_OPERATION,
			].includes(operation.statusCode)
		);
	}

	availableUnits(categoryId: number, currentUnitUuid?: string): UnitOption[] {
		const allOperations = this.detailViews.reduce<EquipmentOperation[]>(
			(result, detail) => result.concat(detail.operations),
			[],
		);
		const used = new Set(
			allOperations
				.filter(
					(operation) =>
						![
							this.OPERATION_RECORD_STATUS_COMPLETED,
							this.OPERATION_RECORD_STATUS_REPLACED,
							this.OPERATION_RECORD_STATUS_CANCELLED,
						].includes(operation.statusCode),
				)
				.map((operation) => operation.equipmentUnitUuid),
		);

		return this.units.filter(
			(unit) =>
				unit.categoryId === categoryId &&
				(unit.uuid === currentUnitUuid || !used.has(unit.uuid)),
		);
	}

	approvedUnit(detail: OperationDetailView): UnitOption | null {
		if (!detail.equipmentUnitId) {
			return null;
		}

		return (
			this.units.find((unit) => unit.id === detail.equipmentUnitId) ||
			null
		);
	}

	categoryIdForOperation(operation: EquipmentOperation): number {
		const detail = this.detailViews.find(
			(item) => item.uuid === operation.requestDetailUuid,
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
					SCHEDULED: 'Scheduled',
					STARTING_SOON: 'Starting Soon',
					ATTENTION: 'Attention',
					ASSIGNED: 'Scheduled',
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

	trackByOperationUuid(
		_index: number,
		operation: EquipmentOperation,
	): string {
		return operation.uuid;
	}

	private buildDetailViews(
		details: RequestDetail[],
		operations: EquipmentOperation[],
	): OperationDetailView[] {
		return details.map((detail) => {
			const detailOperations = operations.filter(
				(operation) => operation.requestDetailUuid === detail.uuid,
			);
			const activeCount = detailOperations.filter(
				(operation) =>
					![
						this.OPERATION_RECORD_STATUS_REPLACED,
						this.OPERATION_RECORD_STATUS_CANCELLED,
					].includes(operation.statusCode),
			).length;

			return {
				...detail,
				categoryCode: detail.equipmentCategoryCode || '',
				categoryName:
					detail.equipmentCategoryName ||
					`Category #${detail.equipmentCategoryId}`,
				operations: detailOperations,
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
		onSuccess?: () => void,
	): void {
		this.clearMessages();
		this.saving = true;

		request$.subscribe({
			next: () => {
				this.saving = false;
				this.successMessage = successMessage;
				this.utilityService.alert('Success', successMessage, 'success');

				onSuccess?.();
				this.loadWorklist(true);
			},
			error: (error) => {
				this.saving = false;
				this.errorMessage = this.getErrorMessage(
					error,
					'Gagal memproses operation.',
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

	getUnitImageUrl(unitUuid?: string | null): string | null {
		if (!unitUuid || this.unavailableUnitImages.has(unitUuid)) {
			return null;
		}

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

	get previewUnit(): UnitOption | null {
		if (!this.previewUnitUuid) {
			return null;
		}

		return this.units.find((unit) => unit.uuid === this.previewUnitUuid) || null;
	}

	get previewUnitImageUrl(): string | null {
		return this.previewUnitUuid
			? this.getUnitImageUrl(this.previewUnitUuid)
			: null;
	}

	private loadUnitImages(request: RequestMaster): void {
		this.imageLoadVersion += 1;
		const currentVersion = this.imageLoadVersion;
		this.releaseUnitImages();
		this.unavailableUnitImages.clear();

		const unitUuids = Array.from(
			new Set(
				(request.details || [])
					.map((detail) => detail.equipmentUnitUuid)
					.filter((uuid): uuid is string => Boolean(uuid)),
			),
		);

		unitUuids.forEach((unitUuid) => {
			this.requestService
				.getUnitImage(unitUuid)
				.pipe(takeUntil(this.destroy$))
				.subscribe({
					next: (blob) => {
						if (currentVersion !== this.imageLoadVersion) {
							return;
						}

						this.unitImageUrls.set(
							unitUuid,
							URL.createObjectURL(blob),
						);
					},
					error: () => {
						if (currentVersion === this.imageLoadVersion) {
							this.unavailableUnitImages.add(unitUuid);
						}
					},
				});
		});
	}

	private releaseUnitImages(): void {
		this.unitImageUrls.forEach((url) => URL.revokeObjectURL(url));
		this.unitImageUrls.clear();
		this.previewUnitUuid = null;
	}

	get requestDetailSubtitle(): string {
		if (!this.selectedRequest) {
			return 'Informasi unit equipment request.';
		}

		switch (this.operationStatus(this.selectedRequest)) {
			case this.OPERATION_STATUS_SCHEDULED:
				return 'Request sudah disetujui dan menunggu planned start.';

			case this.OPERATION_STATUS_STARTING_SOON:
				return `Planned start kurang dari ${this.startingSoonDays} hari. Pastikan kesiapan unit.`;

			case this.OPERATION_STATUS_IN_OPERATION:
				return 'Request berada dalam planned operational period.';

			case this.OPERATION_STATUS_ATTENTION:
				return 'Planned end sudah terlewati dan request belum selesai. Perlu perhatian.';

			case this.OPERATION_STATUS_COMPLETED:
				return 'Seluruh unit telah menyelesaikan operasi.';

			default:
				return 'Informasi unit equipment request.';
		}
	}
}
