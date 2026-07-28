import { Component, Inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { finalize } from 'rxjs';

import {
	CreateRolePayload,
	RoleCompanyOption,
	RoleMaster,
	RoleService,
} from '../role.service';

export interface RoleFormDialogData {
	mode: 'create' | 'edit';
	role?: RoleMaster;
	companies: RoleCompanyOption[];
}

@Component({
	selector: 'app-role-form-dialog',
	templateUrl: './role-form-dialog.component.html',
	styleUrls: ['./role-form-dialog.component.scss'],
	standalone: false,
})
export class RoleFormDialogComponent {
	isSaving = false;
	errorMessage = '';

	readonly form = this.formBuilder.nonNullable.group({
		companyUuid: [this.data.role?.companyUuid ?? '', Validators.required],
		name: [
			this.data.role?.name ?? '',
			[Validators.required, Validators.maxLength(100)],
		],
		code: [
			this.data.role?.code ?? '',
			[
				Validators.required,
				Validators.maxLength(50),
				Validators.pattern(/^[A-Z0-9_]+$/),
			],
		],
		description: [
			this.data.role?.description ?? '',
			Validators.maxLength(255),
		],
		isActive: [Boolean(this.data.role?.isActive ?? true)],
	});

	constructor(
		private readonly formBuilder: FormBuilder,
		private readonly roleService: RoleService,
		private readonly dialogRef: MatDialogRef<RoleFormDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public readonly data: RoleFormDialogData,
	) {
		if (this.isSystemRole) {
			this.form.controls.companyUuid.clearValidators();
			this.form.controls.companyUuid.setValue('');
			this.form.controls.companyUuid.disable();
			this.form.controls.companyUuid.updateValueAndValidity();
		}
	}

	ngOnInit(): void {
		if (this.data.mode === 'edit' && this.data.role) {
			this.form.patchValue({
				companyUuid: this.data.role.companyUuid ?? '',
				name: this.data.role.name,
				code: this.data.role.code,
				description: this.data.role.description ?? '',
				isActive: Boolean(this.data.role.isActive),
			});
		}
	}

	get title(): string {
		return this.data.mode === 'create' ? 'Add Role' : 'Edit Role';
	}

	get isSystemRole(): boolean {
		return Boolean(this.data.role?.isSystem);
	}

	normalizeCode(): void {
		if (this.isSystemRole) {
			return;
		}

		const normalized = this.form.controls.code.value
			.trim()
			.toUpperCase()
			.replace(/[^A-Z0-9]+/g, '_')
			.replace(/^_+|_+$/g, '');

		this.form.controls.code.setValue(normalized);
	}

	save(): void {
		if (this.form.invalid || this.isSaving) {
			this.form.markAllAsTouched();
			return;
		}

		this.isSaving = true;
		this.errorMessage = '';

		const value = this.form.getRawValue();

		const payload: CreateRolePayload = {
			companyUuid: value.companyUuid,
			name: value.name.trim(),
			code: value.code.trim().toUpperCase(),
			description: value.description.trim() || null,
			isActive: value.isActive,
		};

		const request$ =
			this.data.mode === 'create'
				? this.roleService.createRole(payload)
				: this.roleService.updateRole(this.data.role!.uuid, payload);

		request$.pipe(finalize(() => (this.isSaving = false))).subscribe({
			next: () => this.dialogRef.close({ action: 'save' }),
			error: (error) => {
				this.errorMessage =
					error?.error?.meta?.message ?? 'Failed to save role.';
			},
		});
	}

	cancel(): void {
		if (!this.isSaving) {
			this.dialogRef.close();
		}
	}
}
