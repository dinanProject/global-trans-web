import { Component, Inject, OnInit } from '@angular/core';
import {
	FormBuilder,
	FormControl,
	FormGroup,
	Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import {
	CategoryDialogData,
	CategoryDialogResult,
	CategoryPayload,
} from '../category.service';

interface CategoryForm {
	code: FormControl<string>;
	name: FormControl<string>;
	description: FormControl<string | null>;
	isActive: FormControl<boolean>;
}

@Component({
	selector: 'app-category-dialog',
	templateUrl: './category-dialog.component.html',
	styleUrls: ['./category-dialog.component.scss'],
	standalone: false,
})
export class CategoryDialogComponent implements OnInit {
	formGroup!: FormGroup<CategoryForm>;

	formSubmitAttempt = false;
	isEdit = false;

	constructor(
		private formBuilder: FormBuilder,
		private dialogRef: MatDialogRef<CategoryDialogComponent>,
		@Inject(MAT_DIALOG_DATA)
		public data: CategoryDialogData,
	) {}

	ngOnInit(): void {
		this.isEdit = this.data.mode === 'edit';

		this.formGroup = this.formBuilder.group<CategoryForm>({
			code: new FormControl(this.data.category?.code ?? '', {
				nonNullable: true,
				validators: [
					Validators.required,
					Validators.maxLength(50),
					Validators.pattern(/^[A-Za-z0-9_-]+$/),
				],
			}),
			name: new FormControl(this.data.category?.name ?? '', {
				nonNullable: true,
				validators: [Validators.required, Validators.maxLength(150)],
			}),
			description: new FormControl(
				this.data.category?.description ?? null,
				[Validators.maxLength(500)],
			),
			isActive: new FormControl(
				this.data.category
					? this.data.category.isActive === true ||
							this.data.category.isActive === 1
					: true,
				{
					nonNullable: true,
				},
			),
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

	getIconFileName(): string {
		const code = this.formGroup?.controls.code.value.trim().toUpperCase();

		return this.iconByCode[code] || 'equipment.svg';
	}

	getIconPath(): string {
		return `assets/icons/equipment/${this.getIconFileName()}`;
	}

	private readonly iconByCode: Record<string, string> = {
		FORKLIFT: 'forklift.svg',
		MANLIFT: 'manlift.svg',
		TELEHANDLER: 'telehandler.svg',
		CRANE: 'crane.svg',
		SERVICE_TRUCK: 'service-truck.svg',
		TRUCK_MOUNTED_CRANE: 'truck-mounted-crane.svg',
		SKYLIFT: 'skylift.svg',
		FLATBED: 'flatbed.svg',
		TRAILER: 'trailer.svg',
	};

	submit(): void {
		this.formSubmitAttempt = true;

		if (this.formGroup.invalid) {
			this.formGroup.markAllAsTouched();
			return;
		}

		const value = this.formGroup.getRawValue();

		const payload: CategoryPayload = {
			code: value.code.trim().toUpperCase(),
			name: value.name.trim(),
			description: this.normalizeNullableString(value.description),
			icon: this.getIconFileName(),
			isActive: value.isActive,
		};

		const result: CategoryDialogResult = {
			action: 'save',
			payload,
		};

		this.dialogRef.close(result);
	}

	close(): void {
		this.dialogRef.close();
	}

	isInvalid(controlName: keyof CategoryForm): boolean {
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
