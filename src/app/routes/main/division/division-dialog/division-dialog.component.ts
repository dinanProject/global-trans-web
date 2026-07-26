import { Component, Inject, OnInit } from '@angular/core';
import {
	FormBuilder,
	FormControl,
	FormGroup,
	Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import {
	DivisionDialogData,
	DivisionDialogResult,
	DivisionPayload,
} from '../division.service';

interface DivisionForm {
	companyUuid: FormControl<string>;
	code: FormControl<string>;
	name: FormControl<string>;
	description: FormControl<string | null>;
	isActive: FormControl<boolean>;
}

@Component({
	selector: 'app-division-dialog',
	templateUrl: './division-dialog.component.html',
	styleUrls: ['./division-dialog.component.scss'],
	standalone: false,
})
export class DivisionDialogComponent implements OnInit {
	formGroup!: FormGroup<DivisionForm>;

	formSubmitAttempt = false;
	isEdit = false;

	constructor(
		private formBuilder: FormBuilder,
		private dialogRef: MatDialogRef<DivisionDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: DivisionDialogData,
	) {}

	ngOnInit(): void {
		this.isEdit = this.data.mode === 'edit';

		const defaultCompanyUuid =
			this.data.division?.companyUuid ??
			(this.data.companies.length === 1
				? this.data.companies[0].uuid
				: '');

		this.formGroup = this.formBuilder.group<DivisionForm>({
			companyUuid: new FormControl(defaultCompanyUuid, {
				nonNullable: true,
				validators: [Validators.required],
			}),
			code: new FormControl(this.data.division?.code ?? '', {
				nonNullable: true,
				validators: [Validators.required, Validators.maxLength(50)],
			}),
			name: new FormControl(this.data.division?.name ?? '', {
				nonNullable: true,
				validators: [Validators.required, Validators.maxLength(150)],
			}),
			description: new FormControl(
				this.data.division?.description ?? null,
				[Validators.maxLength(500)],
			),
			isActive: new FormControl(this.data.division?.isActive ?? true, {
				nonNullable: true,
			}),
		});
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

		const payload: DivisionPayload = {
			companyUuid: value.companyUuid,
			code: value.code.trim().toUpperCase(),
			name: value.name.trim(),
			description: this.normalizeNullableString(value.description),
			isActive: value.isActive,
		};

		const result: DivisionDialogResult = {
			action: 'save',
			payload,
		};

		this.dialogRef.close(result);
	}

	close(): void {
		this.dialogRef.close();
	}

	isInvalid(controlName: keyof DivisionForm): boolean {
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
