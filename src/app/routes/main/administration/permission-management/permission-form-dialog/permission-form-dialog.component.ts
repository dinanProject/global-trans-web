import { Component, Inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { finalize } from 'rxjs';

import {
	CreatePermissionPayload,
	PermissionMaster,
	PermissionService,
} from '../permission.service';

export interface PermissionFormDialogData {
	mode: 'create' | 'edit';
	permission?: PermissionMaster;
}

@Component({
	selector: 'app-permission-form-dialog',
	templateUrl: './permission-form-dialog.component.html',
	styleUrls: ['./permission-form-dialog.component.scss'],
	standalone: false,
})
export class PermissionFormDialogComponent {
	isSaving = false;
	errorMessage = '';

	readonly form = this.formBuilder.nonNullable.group({
		label: [
			this.data.permission?.label ?? '',
			[Validators.required, Validators.maxLength(120)],
		],
		code: [
			this.data.permission?.code ?? '',
			[
				Validators.required,
				Validators.maxLength(150),
				Validators.pattern(/^[A-Z0-9_.:-]+$/),
			],
		],
		module: [
			this.data.permission?.module ?? '',
			[Validators.required, Validators.maxLength(100)],
		],
		action: [
			this.data.permission?.action ?? '',
			Validators.maxLength(100),
		],
		scope: [
			this.data.permission?.scope ?? '',
			Validators.maxLength(100),
		],
		description: [
			this.data.permission?.description ?? '',
			Validators.maxLength(500),
		],
		isActive: [Boolean(this.data.permission?.isActive ?? true)],
	});

	constructor(
		private readonly formBuilder: FormBuilder,
		private readonly permissionService: PermissionService,
		private readonly dialogRef: MatDialogRef<PermissionFormDialogComponent>,
		@Inject(MAT_DIALOG_DATA)
		public readonly data: PermissionFormDialogData,
	) {}

	get title(): string {
		return this.data.mode === 'create'
			? 'Add Permission'
			: 'Edit Permission';
	}

	get isSystemPermission(): boolean {
		return Boolean(this.data.permission?.isSystem);
	}

	normalizeModule(): void {
		const value = this.form.controls.module.value
			.trim()
			.toUpperCase()
			.replace(/[^A-Z0-9]+/g, '_')
			.replace(/^_+|_+$/g, '');
		this.form.controls.module.setValue(value);
	}

	normalizeAction(): void {
		const value = this.form.controls.action.value
			.trim()
			.toUpperCase()
			.replace(/[^A-Z0-9]+/g, '_')
			.replace(/^_+|_+$/g, '');
		this.form.controls.action.setValue(value);
	}

	normalizeScope(): void {
		const value = this.form.controls.scope.value
			.trim()
			.toUpperCase()
			.replace(/[^A-Z0-9]+/g, '_')
			.replace(/^_+|_+$/g, '');
		this.form.controls.scope.setValue(value);
	}

	normalizeCode(): void {
		if (this.isSystemPermission) {
			return;
		}

		const value = this.form.controls.code.value
			.trim()
			.toUpperCase()
			.replace(/[^A-Z0-9_.:-]+/g, '_')
			.replace(/^_+|_+$/g, '');
		this.form.controls.code.setValue(value);
	}

	generateCode(): void {
		if (this.isSystemPermission) {
			return;
		}

		this.normalizeModule();
		this.normalizeAction();

		const moduleName = this.form.controls.module.value;
		const action = this.form.controls.action.value;
		if (moduleName && action) {
			this.form.controls.code.setValue(`${moduleName}.${action}`);
		}
	}

	save(): void {
		if (this.form.invalid || this.isSaving) {
			this.form.markAllAsTouched();
			return;
		}

		this.isSaving = true;
		this.errorMessage = '';

		const value = this.form.getRawValue();
		const payload: CreatePermissionPayload = {
			label: value.label.trim(),
			code: value.code.trim(),
			module: value.module.trim(),
			action: value.action.trim() || null,
			scope: value.scope.trim() || null,
			description: value.description.trim() || null,
			isActive: value.isActive,
		};

		const request$ =
			this.data.mode === 'create'
				? this.permissionService.createPermission(payload)
				: this.permissionService.updatePermission(
						this.data.permission!.uuid,
						payload,
					);

		request$
			.pipe(finalize(() => (this.isSaving = false)))
			.subscribe({
				next: () => this.dialogRef.close({ action: 'save' }),
				error: (error) => {
					this.errorMessage =
						error?.error?.meta?.message ??
						'Failed to save permission.';
				},
			});
	}

	cancel(): void {
		if (!this.isSaving) {
			this.dialogRef.close();
		}
	}
}
