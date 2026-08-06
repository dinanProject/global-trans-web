import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import {
	Subject,
	debounceTime,
	distinctUntilChanged,
	finalize,
	takeUntil,
} from 'rxjs';

import { UtilityService } from 'src/app/shared/utility/utility.service';
import { RequestAction, RequestMaster } from '../request/request.service';
import {
	RequestDetailDialogComponent,
	RequestDetailDialogData,
} from '../request/request-detail-dialog/request-detail-dialog.component';
import { ApprovalService } from './approvals.service';
import {
	ReviewDialogComponent,
	ReviewDialogResult,
} from './review-dialog/review-dialog.component';

@Component({
	selector: 'app-equipment-request-approvals',
	templateUrl: './approvals.component.html',
	styleUrls: ['./approvals.component.scss'],
	standalone: false,
})
export class ApprovalsComponent implements OnInit, OnDestroy {
	private readonly destroy$ = new Subject<void>();

	private readonly approvalPermissionCodes = new Set([
		'EQUIPMENT_APPROVAL.CLIENT_APPROVE',
		'EQUIPMENT_APPROVAL.CLIENT_REJECT',
		'EQUIPMENT_APPROVAL.GTSI_APPROVE',
		'EQUIPMENT_APPROVAL.GTSI_REJECT',
	]);

	readonly searchControl = new FormControl('', { nonNullable: true });
	readonly stageControl = new FormControl('all', { nonNullable: true });
	readonly maxEquipmentPreview = 1;

	requests: RequestMaster[] = [];
	filteredRequests: RequestMaster[] = [];

	isLoading = false;
	actionUuid = '';
	actionCode = '';
	errorMessage = '';

	constructor(
		private readonly approvalService: ApprovalService,
		private readonly utilityService: UtilityService,
		private readonly dialog: MatDialog,
	) {}

	ngOnInit(): void {
		this.searchControl.valueChanges
			.pipe(
				debounceTime(250),
				distinctUntilChanged(),
				takeUntil(this.destroy$),
			)
			.subscribe(() => this.applyFilters());

		this.stageControl.valueChanges
			.pipe(takeUntil(this.destroy$))
			.subscribe(() => this.applyFilters());

		this.loadRequests();
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	loadRequests(): void {
		this.isLoading = true;
		this.errorMessage = '';

		this.approvalService
			.getApprovals()
			.pipe(
				takeUntil(this.destroy$),
				finalize(() => {
					this.isLoading = false;
				}),
			)
			.subscribe({
				next: (response) => {
					this.requests = Array.isArray(response) ? response : [];

					this.filteredRequests = [...this.requests];
					this.isLoading = false;
				},

				error: (error) => {
					this.errorMessage =
						error?.error?.message ||
						'Failed to load approval requests.';

					this.requests = [];
					this.filteredRequests = [];
					this.isLoading = false;
				},
			});
	}

	resetFilters(): void {
		this.searchControl.setValue('', { emitEvent: false });
		this.stageControl.setValue('all', { emitEvent: false });
		this.applyFilters();
	}

	getEquipmentPreview(details: any[] | null | undefined): any[] {
		return (details ?? []).slice(0, this.maxEquipmentPreview);
	}

	getRemainingEquipmentCount(details: any[] | null | undefined): number {
		return Math.max((details ?? []).length - this.maxEquipmentPreview, 0);
	}

	approvalActions(request: RequestMaster): RequestAction[] {
		return (request.availableActions ?? [])
			.filter((action: RequestAction) =>
				this.approvalPermissionCodes.has(action.permissionCode ?? ''),
			)
			.sort(
				(a: RequestAction, b: RequestAction) =>
					Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0),
			);
	}

	approveActions(request: RequestMaster): RequestAction[] {
		return this.approvalActions(request).filter((action: RequestAction) =>
			this.isApproveAction(action),
		);
	}

	rejectActions(request: RequestMaster): RequestAction[] {
		return this.approvalActions(request).filter((action: RequestAction) =>
			this.isRejectAction(action),
		);
	}

	canReview(request: RequestMaster): boolean {
		return this.approvalActions(request).length > 0;
	}

	openReviewDialog(request: RequestMaster): void {
		if (this.actionUuid) return;

		this.actionUuid = request.uuid;
		this.errorMessage = '';

		this.approvalService
			.getApproval(request.uuid)
			.pipe(
				takeUntil(this.destroy$),
				finalize(() => {
					this.actionUuid = '';
				}),
			)
			.subscribe({
				next: (approvalDetail: RequestMaster) => {
					const actions = this.approvalActions(approvalDetail);
					const approveActions = actions.filter((action) =>
						this.isApproveAction(action),
					);
					const rejectActions = actions.filter((action) =>
						this.isRejectAction(action),
					);

					const action =
						this.getPrimaryReviewAction(approvalDetail) ??
						actions[0];

					if (!action) {
						this.utilityService.alert(
							'Unavailable',
							'Tidak ada approval action yang tersedia untuk request ini.',
							'warning',
						);
						return;
					}

					console.log('[approval detail]', approvalDetail);
					console.log('[approval details]', approvalDetail.details);
					console.log('[review actions]', {
						all: actions,
						approve: approveActions,
						reject: rejectActions,
					});

					const dialogRef = this.dialog.open(ReviewDialogComponent, {
						width: '920px',
						maxWidth: '94vw',
						maxHeight: '94vh',
						disableClose: true,
						autoFocus: false,
						panelClass: 'equipment-request-review-dialog-panel',
						data: {
							request: approvalDetail,
							action,
							actions,
							approveActions,
							rejectActions,
						},
					});

					dialogRef
						.afterClosed()
						.pipe(takeUntil(this.destroy$))
						.subscribe((result?: ReviewDialogResult) => {
							if (!result) return;

							this.submitReview(approvalDetail, result);
						});
				},

				error: (error: HttpErrorResponse) => {
					this.utilityService.alert(
						'Failed',
						error?.error?.meta?.message ??
							error?.error?.message ??
							'Failed to load approval detail.',
						'error',
					);
				},
			});
	}

	openDetailDialog(request: RequestMaster): void {
		const dialogRef = this.dialog.open(RequestDetailDialogComponent, {
			width: '1180px',
			maxWidth: '96vw',
			maxHeight: '94vh',
			disableClose: true,
			autoFocus: false,
			panelClass: 'equipment-request-detail-dialog-panel',
			data: <RequestDetailDialogData>{
				requestUuid: request.uuid,
				source: 'approval',
			},
		});

		dialogRef
			.afterClosed()
			.pipe(takeUntil(this.destroy$))
			.subscribe((result) => {
				if (result?.action === 'refresh') {
					this.loadRequests();
				}
			});
	}

	statusClass(status: string | null | undefined): string {
		return String(status || '')
			.toLowerCase()
			.replace(/_/g, '-');
	}

	stageLabel(request: RequestMaster): string {
		if (request.status === 'CLIENT_REVIEW') {
			return 'Client Approval';
		}

		if (request.status === 'GTSI_REVIEW') {
			return 'Global Trans Review';
		}

		return request.statusStage || request.statusName || request.status;
	}

	getStatusDisplayName(request: RequestMaster): string {
		return request.statusName || request.status;
	}

	trackByUuid(_: number, request: RequestMaster): string {
		return request.uuid;
	}

	isApproveAction(action: RequestAction): boolean {
		return ['APPROVE_CLIENT', 'APPROVE_GTSI'].includes(action.actionCode);
	}

	isRejectAction(action: RequestAction): boolean {
		return ['REJECT_CLIENT', 'REJECT_GTSI'].includes(action.actionCode);
	}

	isClientApprovalAction(action: RequestAction): boolean {
		return ['APPROVE_CLIENT', 'REJECT_CLIENT'].includes(action.actionCode);
	}

	isGtsiAction(action: RequestAction): boolean {
		return ['APPROVE_GTSI', 'REJECT_GTSI'].includes(action.actionCode);
	}

	private getPrimaryReviewAction(
		request: RequestMaster,
	): RequestAction | null {
		const actions = this.approvalActions(request);

		return (
			actions.find((action: RequestAction) =>
				['APPROVE_CLIENT', 'APPROVE_GTSI'].includes(action.actionCode),
			) ??
			actions[0] ??
			null
		);
	}

	private submitReview(
		request: RequestMaster,
		result: ReviewDialogResult,
	): void {
		if (this.actionUuid) return;

		this.actionUuid = request.uuid;
		this.actionCode = result.actionCode;

		this.approvalService
			.executeAction(request.uuid, {
				actionCode: result.actionCode,
				startDate: result.startDate,
				endDate: result.endDate,
				remarks: result.remarks,
			})
			.pipe(
				finalize(() => {
					this.actionUuid = '';
					this.actionCode = '';
				}),
			)
			.subscribe({
				next: () => {
					this.utilityService.alert(
						'Success',
						'Approval request berhasil diproses.',
						'success',
					);

					this.loadRequests();
				},

				error: (error: HttpErrorResponse) => {
					this.showActionError(error);
				},
			});
	}

	private isApprovalRequest(request: RequestMaster): boolean {
		return this.approvalActions(request).length > 0;
	}

	private applyFilters(): void {
		const keyword = this.searchControl.value.trim().toLowerCase();

		const stage = this.stageControl.value;

		this.filteredRequests = this.requests.filter(
			(request: RequestMaster) => {
				if (stage !== 'all' && this.getStageKey(request) !== stage) {
					return false;
				}

				if (!keyword) return true;

				return [
					request.requestNo,
					request.companyName,
					request.companyCode,
					request.divisionName,
					request.requestByName,
					request.purpose,
					request.statusName,
					request.status,
				]
					.filter(Boolean)
					.join(' ')
					.toLowerCase()
					.includes(keyword);
			},
		);
	}

	private getStageKey(request: RequestMaster): string {
		if (request.status === 'CLIENT_REVIEW') {
			return 'client';
		}

		if (request.status === 'GTSI_REVIEW') {
			return 'global-approval';
		}

		return 'other';
	}

	private showActionError(error: HttpErrorResponse): void {
		this.utilityService.alert(
			'Failed',
			error?.error?.meta?.message ??
				error?.error?.message ??
				'Failed to process action.',
			'error',
		);
	}

	formatPeriodDateTime(value?: string | null): string {
		if (!value) {
			return '—';
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
}
