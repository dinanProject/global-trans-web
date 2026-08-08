import { Component, Inject, OnInit } from '@angular/core';
import {
	FormBuilder,
	FormControl,
	FormGroup,
	Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import {
	CompanyDialogData,
	CompanyDialogResult,
	CompanyPayload,
} from '../company.service';

interface CompanyForm {
	typeId: FormControl<number | null>;
	code: FormControl<string>;
	name: FormControl<string>;
	taxNumber: FormControl<string | null>;
	email: FormControl<string | null>;
	phone: FormControl<string | null>;
	address: FormControl<string | null>;
	city: FormControl<string | null>;
	province: FormControl<string | null>;
	postalCode: FormControl<string | null>;
	isActive: FormControl<boolean>;
}

@Component({
	selector: 'app-company-dialog',
	templateUrl: './company-dialog.component.html',
	styleUrls: ['./company-dialog.component.scss'],
	standalone: false,
})
export class CompanyDialogComponent implements OnInit {
	formGroup!: FormGroup<CompanyForm>;

	formSubmitAttempt = false;
	isEdit = false;

	private initialEditValue: CompanyPayload | null = null;

	constructor(
		private formBuilder: FormBuilder,
		private dialogRef: MatDialogRef<CompanyDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: CompanyDialogData,
	) {}

	ngOnInit(): void {
		this.isEdit = this.data.mode === 'edit';

		const defaultTypeId =
			this.data.company?.typeId ??
			(this.data.companyTypes.length === 1
				? this.data.companyTypes[0].id
				: null);

		this.formGroup = this.formBuilder.group<CompanyForm>({
			typeId: new FormControl(defaultTypeId, {
				validators: [Validators.required],
			}),
			code: new FormControl(this.data.company?.code ?? '', {
				nonNullable: true,
				validators: [Validators.required, Validators.maxLength(50)],
			}),
			name: new FormControl(this.data.company?.name ?? '', {
				nonNullable: true,
				validators: [Validators.required, Validators.maxLength(150)],
			}),
			taxNumber: new FormControl(this.data.company?.taxNumber ?? null, [
				Validators.maxLength(50),
			]),
			email: new FormControl(this.data.company?.email ?? null, [
				Validators.email,
				Validators.maxLength(150),
			]),
			phone: new FormControl(this.data.company?.phone ?? null, [
				Validators.maxLength(50),
			]),
			address: new FormControl(this.data.company?.address ?? null, [
				Validators.maxLength(500),
			]),
			city: new FormControl(this.data.company?.city ?? null, [
				Validators.maxLength(100),
			]),
			province: new FormControl(this.data.company?.province ?? null, [
				Validators.maxLength(100),
			]),
			postalCode: new FormControl(this.data.company?.postalCode ?? null, [
				Validators.maxLength(20),
			]),
			isActive: new FormControl(
				this.data.company
					? this.data.company.isActive === true ||
							this.data.company.isActive === 1
					: true,
				{
					nonNullable: true,
				},
			),
		});

		if (this.isEdit) {
			this.formGroup.controls.code.disable({
				emitEvent: false,
			});
		}

		if (this.isEdit && this.data.company) {
			this.initialEditValue = {
				typeId: this.data.company.typeId ?? 0,
				code: this.data.company.code.trim().toUpperCase(),
				name: this.data.company.name.trim(),
				taxNumber: this.normalizeNullableString(
					this.data.company.taxNumber ?? null,
				),
				email: this.normalizeNullableString(
					this.data.company.email ?? null,
				),
				phone: this.normalizeNullableString(
					this.data.company.phone ?? null,
				),
				address: this.normalizeNullableString(
					this.data.company.address ?? null,
				),
				city: this.normalizeNullableString(
					this.data.company.city ?? null,
				),
				province: this.normalizeNullableString(
					this.data.company.province ?? null,
				),
				postalCode: this.normalizeNullableString(
					this.data.company.postalCode ?? null,
				),
				isActive:
					this.data.company.isActive === true ||
					this.data.company.isActive === 1,
			};
		}
	}

	onCodeInput(event: Event): void {
		const input = event.target as HTMLInputElement;
		const upperCaseValue = input.value.toUpperCase();

		input.value = upperCaseValue;

		this.formGroup.controls.code.setValue(upperCaseValue, {
			emitEvent: false,
		});
	}

	submit(): void {
		this.formSubmitAttempt = true;

		if (this.formGroup.invalid) {
			this.formGroup.markAllAsTouched();
			return;
		}

		const value = this.formGroup.getRawValue();

		if (value.typeId === null) {
			return;
		}

		const payload: CompanyPayload = {
			typeId: value.typeId,
			code: value.code.trim().toUpperCase(),
			name: value.name.trim(),
			taxNumber: this.normalizeNullableString(value.taxNumber),
			email: this.normalizeNullableString(value.email),
			phone: this.normalizeNullableString(value.phone),
			address: this.normalizeNullableString(value.address),
			city: this.normalizeNullableString(value.city),
			province: this.normalizeNullableString(value.province),
			postalCode: this.normalizeNullableString(value.postalCode),
			isActive: value.isActive,
		};

		if (this.isEdit && this.initialEditValue) {
			const hasChanges =
				payload.typeId !== this.initialEditValue.typeId ||
				payload.code !== this.initialEditValue.code ||
				payload.name !== this.initialEditValue.name ||
				payload.taxNumber !== this.initialEditValue.taxNumber ||
				payload.email !== this.initialEditValue.email ||
				payload.phone !== this.initialEditValue.phone ||
				payload.address !== this.initialEditValue.address ||
				payload.city !== this.initialEditValue.city ||
				payload.province !== this.initialEditValue.province ||
				payload.postalCode !== this.initialEditValue.postalCode ||
				payload.isActive !== this.initialEditValue.isActive;

			if (!hasChanges) {
				this.dialogRef.close();
				return;
			}
		}

		const result: CompanyDialogResult = {
			action: 'save',
			payload,
		};

		this.dialogRef.close(result);
	}

	close(): void {
		this.dialogRef.close();
	}

	isInvalid(controlName: keyof CompanyForm): boolean {
		const control = this.formGroup.controls[controlName];

		return Boolean(
			control.invalid && (control.touched || this.formSubmitAttempt),
		);
	}

	private normalizeNullableString(value: string | null): string | null {
		if (!value) {
			return null;
		}

		const normalizedValue = value.trim();

		return normalizedValue || null;
	}
}
