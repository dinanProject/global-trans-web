import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subject, finalize, takeUntil } from 'rxjs';

import { UtilityService } from 'src/app/shared/utility/utility.service';
import {
	RequestAction,
	RequestHistory,
	RequestMaster,
	RequestService,
} from '../request.service';
import { ApprovalService } from '../../approvals/approvals.service';

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
		{ label: 'Approval History', icon: 'fas fa-user-check' },
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
		this.selectedTabIndex = this.data.initialTabIndex ?? 0;
		this.loadRequest();
	}

	ngOnDestroy(): void {
		this.imageLoadVersion += 1;
		this.releaseUnitImages();
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
		if (!history?.description || !this.request) {
			return history?.description || '—';
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

		return description;
	}

	formatActivityLabel(activity: string): string {
		return String(activity || 'Activity')
			.replace(/_/g, ' ')
			.toLowerCase()
			.replace(/\b\w/g, (character) => character.toUpperCase());
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
