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
				next: (request) => (this.request = request),
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

	formatHistoryDescription(history: RequestHistory): string {
		if (!history?.description || !this.request) {
			return history?.description || '—';
		}

		let description = history.description;
		const requestNo = this.request.requestNo;

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

	private escapeRegExp(value: string): string {
		return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	}
}
