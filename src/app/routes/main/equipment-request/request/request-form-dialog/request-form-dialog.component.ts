import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { finalize } from 'rxjs';

import {
	CapacityUnitOption,
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
	capacityUnits: CapacityUnitOption[];
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
			this.toDateTimeInputValue(this.data.request?.startDate),
			Validators.required,
		],
		endDate: [
			this.toDateTimeInputValue(this.data.request?.endDate),
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
				equipmentUnitId: [
					detail?.equipmentUnitId ?? null,
					Validators.required,
				],
				requiredCapacityValue: [
					detail?.requiredCapacityValue ?? null,
					[Validators.required, Validators.min(0.01)],
				],
				requiredCapacityUnit: [
					detail?.requiredCapacityUnit ?? '',
					[Validators.required, Validators.maxLength(50)],
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
			requiredCapacityValue: null,
			requiredCapacityUnit: '',
		});
	}

	onUnitChange(detailIndex: number): void {
		const detail = this.details.at(detailIndex);
		const equipmentUnitId = Number(detail.get('equipmentUnitId')?.value);

		const selectedUnit =
			this.data.units.find(
				(unit) => Number(unit.id) === equipmentUnitId,
			) ?? null;

		detail.patchValue({
			requiredCapacityUnit:
				selectedUnit?.capacityUnit?.trim().toUpperCase() ?? '',
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

		const selectedUnitIds = (value.details ?? [])
			.map((detail: any) => Number(detail.equipmentUnitId))
			.filter((unitId: number) => Number.isInteger(unitId) && unitId > 0);

		if (new Set(selectedUnitIds).size !== selectedUnitIds.length) {
			this.errorMessage =
				'Equipment unit yang sama tidak boleh dipilih lebih dari satu kali.';
			return;
		}

		const startDate = this.formatDatabaseDateTime(value.startDate);
		const endDate = this.formatDatabaseDateTime(value.endDate);

		if (!startDate || !endDate) {
			this.errorMessage = 'Format tanggal dan waktu tidak valid.';
			return;
		}
		if (startDate >= endDate) {
			this.errorMessage = 'End date harus lebih besar dari start date.';
			return;
		}

		const payload: RequestPayload = {
			companyUuid: this.data.company?.uuid ?? null,
			divisionUuid: value.divisionUuid || null,
			startDate,
			endDate,
			purpose: value.purpose?.trim() || null,
			notes: value.notes?.trim() || null,
			details: (value.details ?? []).map((detail: any) => ({
				uuid: detail.uuid || null,
				equipmentCategoryId: Number(detail.equipmentCategoryId),
				equipmentUnitId: Number(detail.equipmentUnitId),
				requiredCapacityValue: Number(detail.requiredCapacityValue),
				requiredCapacityUnit:
					detail.requiredCapacityUnit?.trim().toUpperCase() || '',
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

	getCategoryByDetail(index: number): CategoryOption | null {
		const categoryId = Number(
			this.details.at(index).get('equipmentCategoryId')?.value,
		);

		if (!categoryId) {
			return null;
		}

		return (
			this.data.categories.find(
				(category) => Number(category.id) === categoryId,
			) ?? null
		);
	}

	getCategoryIcon(index: number): string {
		const category = this.getCategoryByDetail(index);
		const icon = category?.icon?.trim() || 'equipment.svg';

		return `assets/icons/equipment/${icon}`;
	}

	private markDetailsAsTouched(): void {
		this.details.controls.forEach((control) => {
			control.markAllAsTouched();
			control.updateValueAndValidity();
		});
	}

	private formatDatabaseDateTime(value: string | Date | null): string | null {
		if (!value) return null;

		if (typeof value === 'string') {
			const normalizedValue = value.trim();

			if (!normalizedValue) return null;

			const match = normalizedValue.match(
				/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/,
			);

			if (!match) return null;

			const [, year, month, day, hour, minute] = match;

			return `${year}-${month}-${day} ${hour}:${minute}:00`;
		}

		if (Number.isNaN(value.getTime())) return null;

		return this.formatLocalDateTime(value, 'database');
	}

	private toDateTimeInputValue(
		value: string | Date | null | undefined,
	): string {
		if (!value) return '';

		if (typeof value === 'string') {
			const normalizedValue = value.trim();

			const localDateTimeMatch = normalizedValue.match(
				/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/,
			);

			if (localDateTimeMatch) {
				const [, year, month, day, hour, minute] = localDateTimeMatch;

				return `${year}-${month}-${day}T${hour}:${minute}`;
			}
		}

		const date = value instanceof Date ? value : new Date(value);

		if (Number.isNaN(date.getTime())) return '';

		return this.formatLocalDateTime(date, 'input');
	}

	private formatLocalDateTime(
		date: Date,
		target: 'input' | 'database',
	): string {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		const hour = String(date.getHours()).padStart(2, '0');
		const minute = String(date.getMinutes()).padStart(2, '0');

		if (target === 'input') {
			return `${year}-${month}-${day}T${hour}:${minute}`;
		}

		return `${year}-${month}-${day} ${hour}:${minute}:00`;
	}
}
