import { Component, Inject, OnInit } from '@angular/core';
import {
	FormBuilder,
	FormControl,
	FormGroup,
	Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import {
	UnitCategory,
	UnitDialogData,
	UnitDialogResult,
	UnitPayload,
} from '../unit.service';

interface UnitForm {
	categoryUuid: FormControl<string>;
	unitCode: FormControl<string>;
	unitName: FormControl<string>;
	assetNumber: FormControl<string | null>;
	modelNumber: FormControl<string | null>;
	plateNumber: FormControl<string | null>;
	remarks: FormControl<string | null>;
	isActive: FormControl<boolean>;
}

@Component({
	selector: 'app-unit-dialog',
	templateUrl: './unit-dialog.component.html',
	styleUrls: ['./unit-dialog.component.scss'],
	standalone: false,
})
export class UnitDialogComponent implements OnInit {
	formGroup!: FormGroup<UnitForm>;

	formSubmitAttempt = false;
	isEdit = false;

	constructor(
		private formBuilder: FormBuilder,
		private dialogRef: MatDialogRef<UnitDialogComponent>,
		@Inject(MAT_DIALOG_DATA)
		public data: UnitDialogData,
	) {}

	ngOnInit(): void {
		this.isEdit = this.data.mode === 'edit';

		this.formGroup = this.formBuilder.group<UnitForm>({
			categoryUuid: new FormControl(this.data.unit?.categoryUuid ?? '', {
				nonNullable: true,
				validators: [Validators.required],
			}),
			unitCode: new FormControl(this.data.unit?.unitCode ?? '', {
				nonNullable: true,
				validators: [
					Validators.required,
					Validators.maxLength(50),
					Validators.pattern(/^[A-Za-z0-9_-]+$/),
				],
			}),
			unitName: new FormControl(this.data.unit?.unitName ?? '', {
				nonNullable: true,
				validators: [Validators.required, Validators.maxLength(150)],
			}),
			assetNumber: new FormControl(this.data.unit?.assetNumber ?? null, [
				Validators.maxLength(100),
			]),
			modelNumber: new FormControl(this.data.unit?.modelNumber ?? null, [
				Validators.maxLength(100),
			]),
			plateNumber: new FormControl(this.data.unit?.plateNumber ?? null, [
				Validators.maxLength(50),
			]),
			remarks: new FormControl(this.data.unit?.remarks ?? null, [
				Validators.maxLength(500),
			]),
			isActive: new FormControl(
				this.data.unit
					? this.data.unit.isActive === true ||
							this.data.unit.isActive === 1
					: true,
				{
					nonNullable: true,
				},
			),
		});
	}

	onUnitCodeInput(event: Event): void {
		this.setUppercaseValue(event, this.formGroup.controls.unitCode);
	}

	onAssetNumberInput(event: Event): void {
		this.setUppercaseValue(event, this.formGroup.controls.assetNumber);
	}

	onPlateNumberInput(event: Event): void {
		this.setUppercaseValue(event, this.formGroup.controls.plateNumber);
	}

	submit(): void {
		this.formSubmitAttempt = true;

		if (this.formGroup.invalid) {
			this.formGroup.markAllAsTouched();
			return;
		}

		const value = this.formGroup.getRawValue();

		const payload: UnitPayload = {
			categoryUuid: value.categoryUuid,
			unitCode: value.unitCode.trim().toUpperCase(),
			unitName: value.unitName.trim(),
			assetNumber: this.normalizeNullableUppercaseString(
				value.assetNumber,
			),
			modelNumber: this.normalizeNullableString(value.modelNumber),
			plateNumber: this.normalizeNullableUppercaseString(
				value.plateNumber,
			),
			remarks: this.normalizeNullableString(value.remarks),
			isActive: value.isActive,
		};

		const result: UnitDialogResult = {
			action: 'save',
			payload,
		};

		this.dialogRef.close(result);
	}

	close(): void {
		this.dialogRef.close();
	}

	isInvalid(controlName: keyof UnitForm): boolean {
		const control = this.formGroup.controls[controlName];

		return Boolean(
			control.invalid && (control.touched || this.formSubmitAttempt),
		);
	}

	isCategoryActive(category: UnitCategory): boolean {
		return category.isActive === true || category.isActive === 1;
	}

	get selectedCategory(): UnitCategory | undefined {
		const categoryUuid = this.formGroup?.controls.categoryUuid.value;

		return this.data.categories.find(
			(category) => category.uuid === categoryUuid,
		);
	}

	private setUppercaseValue(
		event: Event,
		control: FormControl<string | null>,
	): void {
		const input = event.target as HTMLInputElement;
		const upperCaseValue = input.value.toUpperCase();

		input.value = upperCaseValue;

		control.setValue(upperCaseValue, {
			emitEvent: false,
		});
	}

	private normalizeNullableString(value: string | null): string | null {
		if (!value) {
			return null;
		}

		const normalizedValue = value.trim();

		return normalizedValue || null;
	}

	private normalizeNullableUppercaseString(
		value: string | null,
	): string | null {
		const normalizedValue = this.normalizeNullableString(value);

		return normalizedValue?.toUpperCase() ?? null;
	}
}
