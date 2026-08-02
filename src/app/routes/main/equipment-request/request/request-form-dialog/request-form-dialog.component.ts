import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { finalize } from 'rxjs';

import {
	CategoryOption,
	RequestCompanyOption,
	RequestDetail,
	RequestDivisionOption,
	RequestMaster,
	RequestPayload,
	RequestService,
	UnitOption,
} from '../request.service';

export interface RequestFormDialogData {
	mode: 'create' | 'edit';
	request?: RequestMaster;
	company: RequestCompanyOption | null;
	divisions: RequestDivisionOption[];
	categories: CategoryOption[];
	units: UnitOption[];
}

@Component({
	selector: 'app-request-form-dialog',
	templateUrl: './request-form-dialog.component.html',
	styleUrls: ['./request-form-dialog.component.scss'],
	standalone: false,
})
export class RequestFormDialogComponent implements OnInit {
	isSaving = false;
	errorMessage = '';

	readonly form = this.formBuilder.group({
		companyId: [this.data.company?.id ?? null, Validators.required],
		divisionUuid: [this.data.request?.divisionUuid ?? ''],
		startDate: [
			this.toDateInputValue(this.data.request?.startDate),
			Validators.required,
		],
		endDate: [
			this.toDateInputValue(this.data.request?.endDate),
			Validators.required,
		],
		purpose: [
			this.data.request?.purpose ?? '',
			Validators.maxLength(65535),
		],
		notes: [this.data.request?.notes ?? '', Validators.maxLength(65535)],
		details: this.formBuilder.array([]),
	});

	constructor(
		private readonly formBuilder: FormBuilder,
		private readonly requestService: RequestService,
		private readonly dialogRef: MatDialogRef<RequestFormDialogComponent>,
		@Inject(MAT_DIALOG_DATA)
		public readonly data: RequestFormDialogData,
	) {}

	ngOnInit(): void {
		console.log('RequestFormDialogComponent data:', this.data);

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
				remarks: [detail?.remarks ?? '', Validators.maxLength(1000)],
			}),
		);
	}

	removeDetail(index: number): void {
		if (this.details.length <= 1) return;
		this.details.removeAt(index);
	}

	getUnitsByCategory(detailIndex: number): UnitOption[] {
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
		if (this.form.invalid) {
			this.form.markAllAsTouched();
			this.markDetailsAsTouched();
			this.errorMessage = 'Mohon lengkapi data request yang wajib diisi.';
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

		const payload: RequestPayload = {
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
				remarks: detail.remarks?.trim() || null,
			})),
		};

		this.isSaving = true;
		this.errorMessage = '';

		const request$ =
			this.data.mode === 'create'
				? this.requestService.createRequest(payload)
				: this.requestService.updateRequest(
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

	private markDetailsAsTouched(): void {
		this.details.controls.forEach((control) => {
			control.markAllAsTouched();
			control.updateValueAndValidity();
		});
	}

	private formatDatabaseDate(value: string | Date | null): string | null {
		if (!value) return null;

		if (typeof value === 'string') {
			return value.trim() || null;
		}

		if (Number.isNaN(value.getTime())) return null;

		const year = value.getFullYear();
		const month = String(value.getMonth() + 1).padStart(2, '0');
		const day = String(value.getDate()).padStart(2, '0');

		return `${year}-${month}-${day}`;
	}

	private toDateInputValue(value: string | Date | null | undefined): string {
		if (!value) return '';

		const date = value instanceof Date ? value : new Date(value);

		if (Number.isNaN(date.getTime())) return '';

		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');

		return `${year}-${month}-${day}`;
	}
}
