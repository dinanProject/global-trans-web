import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subject, finalize, takeUntil } from 'rxjs';

import { UtilityService } from 'src/app/shared/utility/utility.service';
import {
	RequestAction,
	RequestAttachment,
	RequestHistory,
	RequestMaster,
	RequestService,
} from '../request.service';
import { ApprovalService } from '../../approvals/approvals.service';


interface RequestJourneyItem {
	title: string;
	description: string;
	state: 'completed' | 'current' | 'upcoming' | 'rejected';
	date?: string | null;
	actor?: string | null;
	remarks?: string | null;
	icon: string;
}

export interface RequestDetailDialogData {
	requestUuid: string;
	initialTabIndex?: number;
	source?: 'request' | 'approval';
}

@Component({
	selector: 'app-request-detail-dialog',
	templateUrl: './request-detail-dialog.component.html',
	styleUrls: ['./request-detail-dialog.component.scss'],
	standalone: false,
})
export class RequestDetailDialogComponent implements OnInit, OnDestroy {
	private readonly destroy$ = new Subject<void>();
	private readonly uuidPattern =
		/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/gi;

	request?: RequestMaster;
	attachments: RequestAttachment[] = [];
	readonly attachmentImageUrls = new Map<string, string>();
	readonly unitImageUrls = new Map<string, string>();
	previewUnitUuid: string | null = null;
	private readonly unavailableUnitImages = new Set<string>();
	private imageLoadVersion = 0;
	isLoading = false;
	actionCode = '';
	errorMessage = '';
	selectedTabIndex = 0;
	readonly tabs = [
		{ label: 'Information', icon: 'far fa-file-alt' },
		{ label: 'Equipment Details', icon: 'fas fa-tools' },
		{ label: 'Activity', icon: 'fas fa-history' },
	];

	constructor(
		private readonly requestService: RequestService,
		private readonly approvalService: ApprovalService,
		private readonly utilityService: UtilityService,
		private readonly dialogRef: MatDialogRef<RequestDetailDialogComponent>,
		@Inject(MAT_DIALOG_DATA)
		public readonly data: RequestDetailDialogData,
	) {}

	ngOnInit(): void {
		const initialTabIndex = this.data.initialTabIndex ?? 0;
		this.selectedTabIndex = initialTabIndex >= 3 ? 2 : initialTabIndex;
		this.loadRequest();
	}

	ngOnDestroy(): void {
		this.imageLoadVersion += 1;
		this.releaseUnitImages();
		this.attachmentImageUrls.forEach((url) => URL.revokeObjectURL(url));
		this.attachmentImageUrls.clear();
		this.destroy$.next();
		this.destroy$.complete();
	}

	loadRequest(): void {
		this.isLoading = true;
		this.errorMessage = '';

		const request$ =
			this.data.source === 'approval'
				? this.approvalService.getApproval(this.data.requestUuid)
				: this.requestService.getRequest(this.data.requestUuid);

		request$
			.pipe(
				takeUntil(this.destroy$),
				finalize(() => (this.isLoading = false)),
			)
			.subscribe({
				next: (request) => {
					this.request = request;
					this.loadUnitImages(request);
					this.loadAttachments(request.uuid!);
				},
				error: (error) =>
					(this.errorMessage =
						error?.error?.meta?.message ??
						error?.error?.message ??
						'Failed to load equipment request.'),
			});
	}

	async executeAction(action: RequestAction): Promise<void> {
		if (!this.request || this.actionCode) return;
		let remarks: string | null = null;
		if (action.requiresRemarks) {
			const value = window.prompt(`${action.actionName} remarks:`);
			if (value === null) return;
			remarks = value.trim();
			if (!remarks) {
				this.utilityService.alert(
					'Incomplete',
					'Remarks wajib diisi.',
					'warning',
				);
				return;
			}
		}
		const confirmed = await this.utilityService.confirm(
			action.confirmationTitle || action.actionName,
			action.confirmationMessage ||
				`Continue action ${action.actionName}?`,
			'warning',
		);
		if (!confirmed) return;
		this.actionCode = action.actionCode;
		this.requestService
			.executeAction(this.request.uuid, {
				actionCode: action.actionCode,
				remarks,
			})
			.pipe(finalize(() => (this.actionCode = '')))
			.subscribe({
				next: () => {
					this.utilityService.alert(
						'Success',
						`${action.actionName} berhasil diproses.`,
						'success',
					);
					this.loadRequest();
				},
				error: (error) =>
					this.utilityService.alert(
						'Failed',
						error?.error?.meta?.message ??
							'Failed to process action.',
						'error',
					),
			});
	}

	openAttachment(attachment: RequestAttachment): void {
		if (!this.request?.uuid) return;
		this.requestService.downloadAttachment(this.request.uuid, attachment.uuid).pipe(takeUntil(this.destroy$)).subscribe({
			next: (blob) => {
				const url = URL.createObjectURL(blob);
				window.open(url, '_blank', 'noopener,noreferrer');
				setTimeout(() => URL.revokeObjectURL(url), 60000);
			},
			error: () => this.utilityService.alert('Failed', 'Failed to open attachment.', 'error'),
		});
	}

	formatFileSize(bytes: number): string {
		if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	}

	private loadAttachments(requestUuid: string): void {
		this.attachmentImageUrls.forEach((url) => URL.revokeObjectURL(url));
		this.attachmentImageUrls.clear();
		this.requestService.getAttachments(requestUuid).pipe(takeUntil(this.destroy$)).subscribe({
			next: (attachments) => {
				this.attachments = attachments ?? [];
				this.attachments.filter((item) => item.mimeType?.startsWith('image/')).forEach((item) => {
					this.requestService.downloadAttachment(requestUuid, item.uuid).pipe(takeUntil(this.destroy$)).subscribe({
						next: (blob) => this.attachmentImageUrls.set(item.uuid, URL.createObjectURL(blob)),
					});
				});
			},
			error: () => (this.attachments = []),
		});
	}

	statusClass(status: string): string {
		return String(status || '')
			.toLowerCase()
			.replace(/_/g, '-');
	}

	getCategoryName(detail: {
		equipmentCategoryName?: string | null;
		categoryName?: string | null;
		equipmentCategoryCode?: string | null;
		equipmentCategoryId?: number | null;
	}): string {
		return (
			detail.equipmentCategoryName ||
			detail.categoryName ||
			detail.equipmentCategoryCode ||
			(detail.equipmentCategoryId != null
				? `Category ${detail.equipmentCategoryId}`
				: '—')
		);
	}

	selectTab(index: number): void {
		this.selectedTabIndex = index;
	}

	get currentStageLabel(): string {
		if (!this.request) return '—';

		const status = String(this.request.status || '').toUpperCase();
		if (status === 'DRAFT') return 'Draft';
		if (status === 'CLIENT_REVIEW') return 'Exxon Review';
		if (status === 'REJECTED') return 'Rejected';
		if (status === 'CANCELLED') return 'Cancelled';
		if (status === 'COMPLETED') return 'Completed';

		if (status === 'APPROVED') {
			const now = Date.now();
			const start = new Date(this.request.startDate).getTime();
			const end = new Date(this.request.endDate).getTime();

			if (Number.isFinite(end) && now > end) return 'Attention';
			if (Number.isFinite(start) && now >= start) return 'In Operation';
			if (Number.isFinite(start)) {
				const reminderWindowMs = 3 * 24 * 60 * 60 * 1000;
				if (start - now <= reminderWindowMs) return 'Starting Soon';
			}
			return 'Scheduled';
		}

		return this.request.statusName || this.request.status || '—';
	}

	get requestJourney(): RequestJourneyItem[] {
		if (!this.request) return [];

		const histories = this.request.histories || [];
		const approvals = this.request.approvals || [];
		const status = String(this.request.status || '').toUpperCase();
		const now = Date.now();
		const plannedStart = new Date(this.request.startDate).getTime();
		const plannedEnd = new Date(this.request.endDate).getTime();
		const reminderWindowMs = 3 * 24 * 60 * 60 * 1000;

		const submitted = histories.find(
			(history) => String(history.activity || '').toUpperCase() === 'SUBMIT',
		);
		const completedHistories = histories.filter((history) =>
			String(history.activity || '').toUpperCase().includes('COMPLETE'),
		);
		const completedHistory = completedHistories
			.slice()
			.sort(
				(a, b) =>
					new Date(b.createdAt).getTime() -
					new Date(a.createdAt).getTime(),
			)[0];
		const exxonApproval = approvals
			.slice()
			.sort((a, b) => a.approvalLevel - b.approvalLevel)[0];

		const isApproved =
			String(exxonApproval?.status || '').toUpperCase() === 'APPROVED' ||
			['APPROVED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED'].includes(status);
		const isRejected =
			String(exxonApproval?.status || '').toUpperCase() === 'REJECTED' ||
			status === 'REJECTED';
		const isCompleted = status === 'COMPLETED';
		const beforeStart = Number.isFinite(plannedStart) && now < plannedStart;
		const startingSoon =
			beforeStart && plannedStart - now <= reminderWindowMs;
		const inOperation =
			!isCompleted &&
			Number.isFinite(plannedStart) &&
			Number.isFinite(plannedEnd) &&
			now >= plannedStart &&
			now <= plannedEnd;
		const overdue =
			!isCompleted && Number.isFinite(plannedEnd) && now > plannedEnd;

		const items: RequestJourneyItem[] = [
			{
				title: 'Request Submitted',
				description: submitted
					? 'Request submitted to Exxon for final approval.'
					: 'Request is still in draft and has not been submitted.',
				state: submitted ? 'completed' : 'current',
				date: submitted?.createdAt || null,
				actor: submitted?.userName || this.request.requestByName || null,
				icon: 'fas fa-paper-plane',
			},
		];

		if (isRejected) {
			items.push({
				title: 'Exxon Rejected',
				description: 'Exxon made the final decision and rejected the request.',
				state: 'rejected',
				date: exxonApproval?.actionDate || null,
				actor: exxonApproval?.userName || exxonApproval?.roleName || null,
				remarks: exxonApproval?.remarks || null,
				icon: 'fas fa-times',
			});
			return items;
		}

		items.push({
			title: isApproved ? 'Exxon Approved' : 'Exxon Approval',
			description: isApproved
				? 'Exxon approved the request and authorized the final planned period.'
				: 'Waiting for Exxon final approval.',
			state: isApproved ? 'completed' : status === 'CLIENT_REVIEW' ? 'current' : 'upcoming',
			date: exxonApproval?.actionDate || null,
			actor: exxonApproval?.userName || exxonApproval?.roleName || null,
			remarks: exxonApproval?.remarks || null,
			icon: 'fas fa-user-check',
		});

		items.push(
			{
				title: 'Scheduled',
				description: isApproved
					? 'Final operational period is scheduled from the approved planned dates.'
					: 'Operational schedule will be finalized after approval.',
				state: isApproved ? 'completed' : 'upcoming',
				date: isApproved ? this.request.startDate : null,
				icon: 'far fa-calendar-alt',
			},
			{
				title: 'Starting Soon',
				description: startingSoon
					? 'Planned start is within the 3-day reminder window.'
					: 'This stage becomes active within 3 days before planned start.',
				state: startingSoon
					? 'current'
					: isApproved && !beforeStart
						? 'completed'
						: 'upcoming',
				date: null,
				icon: 'fas fa-hourglass-half',
			},
			{
				title: overdue ? 'Attention / Overdue' : 'In Operation',
				description: overdue
					? 'Planned end has passed and completion is still required.'
					: inOperation
						? 'Request is currently within the planned operational period.'
						: 'Operation follows the approved planned start and end period.',
				state: overdue || inOperation
					? 'current'
					: isCompleted
						? 'completed'
						: 'upcoming',
				date: Number.isFinite(plannedStart) ? this.request.startDate : null,
				icon: overdue ? 'fas fa-exclamation-triangle' : 'fas fa-play-circle',
			},
			{
				title: 'Completed',
				description: isCompleted
					? 'All authorized units have completed operation.'
					: 'Completion is recorded after all authorized units are finished.',
				state: isCompleted ? 'completed' : 'upcoming',
				date: completedHistory?.createdAt || null,
				actor: completedHistory?.userName || null,
				icon: 'fas fa-flag',
			},
		);

		return items;
	}

	getCategoryIcon(icon?: string | null): string {
		const normalizedIcon = icon?.trim();

		if (!normalizedIcon || normalizedIcon.startsWith('fas ')) {
			return 'assets/icons/equipment/equipment.svg';
		}

		return `assets/icons/equipment/${normalizedIcon}`;
	}

	getUnitImageUrl(unitUuid?: string | null): string | null {
		if (!unitUuid || this.unavailableUnitImages.has(unitUuid)) {
			return null;
		}

		return this.unitImageUrls.get(unitUuid) || null;
	}

	openUnitImagePreview(unitUuid?: string | null): void {
		if (!unitUuid || !this.getUnitImageUrl(unitUuid)) return;

		this.previewUnitUuid = unitUuid;
	}

	closeUnitImagePreview(): void {
		this.previewUnitUuid = null;
	}

	get previewUnitDetail() {
		if (!this.previewUnitUuid) return null;

		return (
			(this.request?.details || []).find(
				(detail) => detail.equipmentUnitUuid === this.previewUnitUuid,
			) ?? null
		);
	}

	get previewUnitImageUrl(): string | null {
		return this.previewUnitUuid
			? this.getUnitImageUrl(this.previewUnitUuid)
			: null;
	}

	formatHistoryDescription(history: RequestHistory): string {
		if (!this.request) {
			return history?.description || '—';
		}

		const code = String(history?.activity || '').toUpperCase();
		if (code === 'CREATE') {
			return `Equipment request ${this.request.requestNo} created as draft.`;
		}
		if (code === 'SUBMIT') {
			return 'Request submitted to Exxon for final approval.';
		}
		if (code === 'APPROVE_CLIENT') {
			return 'Exxon approved the request and authorized the final planned period.';
		}
		if (code === 'REJECT_CLIENT') {
			return 'Exxon made the final decision and rejected the request.';
		}
		if (code === 'AUTO_ASSIGN_EQUIPMENT') {
			return 'Equipment was scheduled automatically using the final approved planned period.';
		}
		if (code === 'COMPLETE_ASSIGNMENT') {
			return 'Operation completion was recorded for this request.';
		}

		if (!history?.description) {
			return '—';
		}

		let description = history.description;
		const requestNo = this.request.requestNo;
		const details = this.request.details || [];

		// Presentation-only normalization. API payloads and workflow functions remain unchanged.
		description = description.replace(
			/request detail\s+[0-9a-f-]{36}/gi,
			`request ${requestNo}`,
		);
		description = description.replace(
			/equipment request\s+[0-9a-f-]{36}/gi,
			`equipment request ${requestNo}`,
		);
		if (this.request.uuid) {
			description = description.replace(
				new RegExp(this.escapeRegExp(this.request.uuid), 'gi'),
				requestNo,
			);
		}

		details.forEach((detail) => {
			if (!detail.equipmentUnitUuid) return;

			const unitLabel =
				detail.equipmentUnitName ||
				detail.equipmentUnitCode ||
				'Equipment unit';
			description = description.replace(
				new RegExp(this.escapeRegExp(detail.equipmentUnitUuid), 'gi'),
				unitLabel,
			);
		});

		const singleUnitLabel =
			details.length === 1
				? details[0].equipmentUnitName ||
					details[0].equipmentUnitCode ||
					'Equipment unit'
				: 'Equipment assignment';

		// Assignment UUID is not exposed in the request detail payload. For a single-unit
		// request the unit is unambiguous; for multi-unit requests keep a human-readable
		// entity label instead of guessing the wrong unit.
		description = description.replace(
			/Assignment\s+[0-9a-f-]{36}/gi,
			singleUnitLabel,
		);

		// Operation UUID is an internal technical identifier. The request number is
		// already visible in the dialog header, so keep the audit description readable.
		description = description.replace(
			/Operation\s+[0-9a-f-]{36}/gi,
			'Operation',
		);

		return description;
	}

	getActivityRemarks(activity: string): string | null {
		const code = String(activity || '').toUpperCase();
		if (!['APPROVE_CLIENT', 'REJECT_CLIENT'].includes(code)) {
			return null;
		}

		const approval = (this.request?.approvals || [])
			.slice()
			.sort((a, b) => a.approvalLevel - b.approvalLevel)[0];

		return approval?.remarks?.trim() || null;
	}

	formatActivityLabel(activity: string): string {
		const code = String(activity || '').toUpperCase();

		if (code === 'CREATE') return 'Request Created';
		if (code === 'SUBMIT') return 'Request Submitted';
		if (code === 'APPROVE_CLIENT') return 'Exxon Approved';
		if (code === 'REJECT_CLIENT') return 'Exxon Rejected';
		if (code === 'AUTO_ASSIGN_EQUIPMENT') return 'Scheduled';
		if (code === 'COMPLETE_ASSIGNMENT') return 'Completed';

		return String(activity || 'Activity')
			.replace(/_/g, ' ')
			.toLowerCase()
			.replace(/\b\w/g, (character) => character.toUpperCase());
	}

	getActivityIcon(activity: string): string {
		const code = String(activity || '').toUpperCase();

		if (code === 'CREATE') return 'far fa-file-alt';
		if (code === 'SUBMIT') return 'fas fa-paper-plane';
		if (code.includes('APPROVE')) return 'fas fa-user-check';
		if (code.includes('REJECT')) return 'fas fa-times';
		if (code.includes('COMPLETE')) return 'fas fa-flag';
		if (code.includes('ASSIGN')) return 'far fa-calendar-check';
		if (code.includes('START')) return 'fas fa-play';
		if (code.includes('CANCEL')) return 'fas fa-ban';
		if (code.includes('RETURN')) return 'fas fa-undo';

		return 'fas fa-history';
	}

	trackByUuid(
		index: number,
		item: { uuid?: string | null },
	): string | number {
		return item?.uuid || index;
	}

	close(): void {
		this.dialogRef.close({ action: 'refresh' });
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

						const previousUrl = this.unitImageUrls.get(unitUuid);
						if (previousUrl) {
							URL.revokeObjectURL(previousUrl);
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
		this.previewUnitUuid = null;
		this.unitImageUrls.forEach((url) => URL.revokeObjectURL(url));
		this.unitImageUrls.clear();
	}

	private escapeRegExp(value: string): string {
		return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	}
}
