import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { finalize } from 'rxjs';

import {
	EquipmentCategoryOption,
	EquipmentRequestCompanyOption,
	EquipmentRequestDetail,
	EquipmentRequestDivisionOption,
	EquipmentRequestMaster,
	EquipmentRequestPayload,
	EquipmentRequestService,
	EquipmentUnitOption,
} from '../equipment-request.service';

export interface EquipmentRequestFormDialogData {
	mode: 'create' | 'edit';
	request?: EquipmentRequestMaster;
	company: EquipmentRequestCompanyOption | null;
	divisions: EquipmentRequestDivisionOption[];
	categories: EquipmentCategoryOption[];
	units: EquipmentUnitOption[];
}

@Component({
	selector: 'app-equipment-request-form-dialog',
	templateUrl: './equipment-request-form-dialog.component.html',
	styleUrls: ['./equipment-request-form-dialog.component.scss'],
	standalone: false,
})
export class EquipmentRequestFormDialogComponent implements OnInit {
	isSaving = false;
	errorMessage = '';

	readonly form = this.formBuilder.group({
		companyId: [this.data.company?.id ?? null, Validators.required],
		divisionUuid: [this.data.request?.divisionUuid ?? ''],
		startDate: this.parseDatabaseDate(this.data.request?.startDate),
		endDate: this.parseDatabaseDate(this.data.request?.endDate),
		purpose: [
			this.data.request?.purpose ?? '',
			Validators.maxLength(65535),
		],
		notes: [this.data.request?.notes ?? '', Validators.maxLength(65535)],
		details: this.formBuilder.array([]),
	});

	constructor(
		private readonly formBuilder: FormBuilder,
		private readonly equipmentRequestService: EquipmentRequestService,
		private readonly dialogRef: MatDialogRef<EquipmentRequestFormDialogComponent>,
		@Inject(MAT_DIALOG_DATA)
		public readonly data: EquipmentRequestFormDialogData,
	) {}

	ngOnInit(): void {
		const details = this.data.request?.details ?? [];
		if (details.length) details.forEach((detail) => this.addDetail(detail));
		else this.addDetail();
	}

	get title(): string {
		return this.data.mode === 'create'
			? 'Add Equipment Request'
			: 'Edit Equipment Request';
	}

	get details(): FormArray {
		return this.form.controls.details;
	}

	addDetail(detail?: any): void {
		this.details.push(
			this.formBuilder.group({
				uuid: [detail?.uuid ?? null],
				equipmentCategoryId: [
					detail?.equipmentCategoryId ?? null,
					[Validators.required, Validators.min(1)],
				],
				equipmentUnitId: [detail?.equipmentUnitId ?? null],
				quantity: [
					detail?.quantity ?? 1,
					[Validators.required, Validators.min(1)],
				],
				rate: [detail?.rate ?? null, Validators.min(0)],
				remarks: [detail?.remarks ?? '', Validators.maxLength(1000)],
			}),
		);
	}

	removeDetail(index: number): void {
		if (this.details.length <= 1) return;
		this.details.removeAt(index);
	}

	getUnitsByCategory(detailIndex: number): EquipmentUnitOption[] {
		const categoryId = Number(
			this.details.at(detailIndex).get('equipmentCategoryId')?.value,
		);

		if (!categoryId) return [];

		return this.data.units.filter(
			(unit) => Number(unit.categoryId) === categoryId,
		);
	}

	onCategoryChange(detailIndex: number): void {
		this.details.at(detailIndex).patchValue({
			equipmentUnitId: null,
		});
	}

	save(): void {
		if (this.form.invalid || this.isSaving) {
			this.form.markAllAsTouched();
			return;
		}

		const value = this.form.getRawValue();
		const startDate = this.formatDatabaseDate(value.startDate);
		const endDate = this.formatDatabaseDate(value.endDate);

		if (!startDate || !endDate) {
			this.errorMessage = 'Format tanggal harus dd/mm/yyyy.';
			return;
		}

		if (startDate > endDate) {
			this.errorMessage =
				'End date tidak boleh lebih kecil dari start date.';
			return;
		}

		const payload: EquipmentRequestPayload = {
			companyId: Number(value.companyId),
			divisionUuid: value.divisionUuid || null,
			startDate,
			endDate,
			purpose: value.purpose?.trim() || null,
			notes: value.notes?.trim() || null,
			details: (value.details ?? []).map((detail: any) => ({
				uuid: detail.uuid || null,
				equipmentCategoryId: Number(detail.equipmentCategoryId),
				equipmentUnitId: detail.equipmentUnitId
					? Number(detail.equipmentUnitId)
					: null,
				quantity: Number(detail.quantity),
				rate:
					detail.rate === null || detail.rate === ''
						? null
						: Number(detail.rate),
				remarks: detail.remarks?.trim() || null,
			})),
		};

		this.isSaving = true;
		this.errorMessage = '';

		const request$ =
			this.data.mode === 'create'
				? this.equipmentRequestService.createRequest(payload)
				: this.equipmentRequestService.updateRequest(
						this.data.request!.uuid,
						payload,
					);

		request$.pipe(finalize(() => (this.isSaving = false))).subscribe({
			next: () => this.dialogRef.close({ action: 'save' }),
			error: (error) => {
				this.errorMessage =
					error?.error?.meta?.message ??
					'Failed to save equipment request.';
			},
		});
	}

	cancel(): void {
		if (!this.isSaving) this.dialogRef.close();
	}

	private createDetailForm(detail?: EquipmentRequestDetail): FormGroup {
		return this.formBuilder.group({
			equipmentCategoryId: [
				detail?.equipmentCategoryId ?? null,
				Validators.required,
			],
			equipmentUnitId: [
				detail?.equipmentUnitId ?? null,
				Validators.required,
			],
			quantity: [
				detail?.quantity ?? 1,
				[Validators.required, Validators.min(1)],
			],
			rate: [detail?.rate ?? null],
			remarks: [detail?.remarks ?? ''],
		});
	}

	private formatDatabaseDate(value: Date | string | null): string | null {
		if (!value) return null;

		const date = value instanceof Date ? value : new Date(value);

		if (Number.isNaN(date.getTime())) return null;

		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');

		return `${year}-${month}-${day}`;
	}

	private parseDatabaseDate(value: string | null | undefined): Date | null {
		if (!value) return null;

		const [year, month, day] = value
			.substring(0, 10)
			.split('-')
			.map(Number);

		if (!year || !month || !day) return null;

		return new Date(year, month - 1, day);
	}
}
