import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subject, finalize, takeUntil } from 'rxjs';

import { UtilityService } from 'src/app/shared/utility/utility.service';
import {
	RequestAction,
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
	request?: RequestMaster;
	isLoading = false;
	actionCode = '';
	errorMessage = '';
	selectedTabIndex = 0;

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
	close(): void {
		this.dialogRef.close({ action: 'refresh' });
	}
}
