import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subject, finalize, takeUntil } from 'rxjs';

import { UtilityService } from 'src/app/shared/utility/utility.service';
import { EquipmentRequestAction, EquipmentRequestMaster, EquipmentRequestService } from '../equipment-request.service';

export interface EquipmentRequestDetailDialogData { requestUuid: string; }

@Component({
	selector: 'app-equipment-request-detail-dialog',
	templateUrl: './equipment-request-detail-dialog.component.html',
	styleUrls: ['./equipment-request-detail-dialog.component.scss'],
	standalone: false,
})
export class EquipmentRequestDetailDialogComponent implements OnInit, OnDestroy {
	private readonly destroy$ = new Subject<void>();
	request?: EquipmentRequestMaster;
	isLoading = false;
	actionCode = '';
	errorMessage = '';

	constructor(
		private readonly equipmentRequestService: EquipmentRequestService,
		private readonly utilityService: UtilityService,
		private readonly dialogRef: MatDialogRef<EquipmentRequestDetailDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public readonly data: EquipmentRequestDetailDialogData,
	) {}

	ngOnInit(): void { this.loadRequest(); }
	ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

	loadRequest(): void {
		this.isLoading = true;
		this.errorMessage = '';
		this.equipmentRequestService.getRequest(this.data.requestUuid)
			.pipe(takeUntil(this.destroy$), finalize(() => (this.isLoading = false)))
			.subscribe({
				next: (request) => (this.request = request),
				error: (error) => (this.errorMessage = error?.error?.meta?.message ?? 'Failed to load equipment request.'),
			});
	}

	async executeAction(action: EquipmentRequestAction): Promise<void> {
		if (!this.request || this.actionCode) return;
		let remarks: string | null = null;
		if (action.requiresRemarks) {
			const value = window.prompt(`${action.actionName} remarks:`);
			if (value === null) return;
			remarks = value.trim();
			if (!remarks) {
				this.utilityService.alert('Incomplete', 'Remarks wajib diisi.', 'warning');
				return;
			}
		}
		const confirmed = await this.utilityService.confirm(
			action.confirmationTitle || action.actionName,
			action.confirmationMessage || `Continue action ${action.actionName}?`,
			'warning',
		);
		if (!confirmed) return;
		this.actionCode = action.actionCode;
		this.equipmentRequestService.executeAction(this.request.uuid, { actionCode: action.actionCode, remarks })
			.pipe(finalize(() => (this.actionCode = '')))
			.subscribe({
				next: () => {
					this.utilityService.alert('Success', `${action.actionName} berhasil diproses.`, 'success');
					this.loadRequest();
				},
				error: (error) => this.utilityService.alert('Failed', error?.error?.meta?.message ?? 'Failed to process action.', 'error'),
			});
	}

	statusClass(status: string): string { return String(status || '').toLowerCase().replace(/_/g, '-'); }
	close(): void { this.dialogRef.close({ action: 'refresh' }); }
}
