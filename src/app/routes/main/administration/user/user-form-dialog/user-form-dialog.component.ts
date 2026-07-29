import { Component, Inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { finalize } from 'rxjs';

import {
	UserMaster,
	UserOptions,
	UserPayload,
	UserRoleOption,
	UserService,
} from '../user.service';

export interface UserFormDialogData {
	mode: 'create' | 'edit';
	user?: UserMaster;
	options: UserOptions;
}

interface RoleGroup {
	key: string;
	name: string;
	description: string;
	roles: UserRoleOption[];
}

@Component({
	selector: 'app-user-form-dialog',
	templateUrl: './user-form-dialog.component.html',
	styleUrls: ['./user-form-dialog.component.scss'],
	standalone: false,
})
export class UserFormDialogComponent {
	isSaving = false;
	errorMessage = '';

	readonly form = this.formBuilder.nonNullable.group({
		fullName: [
			this.data.user?.fullName ?? '',
			[Validators.required, Validators.maxLength(150)],
		],
		email: [
			this.data.user?.email ?? '',
			[Validators.required, Validators.email, Validators.maxLength(150)],
		],
		phone: [this.data.user?.phone ?? '', [Validators.maxLength(30)]],
		companyUuid: [this.data.user?.companyUuid ?? '', Validators.required],
		divisionUuid: [this.data.user?.divisionUuid ?? ''],
		roleUuids: [
			this.data.user?.roles?.map((role) => role.uuid) ?? [],
			Validators.required,
		],
		password: [
			'',
			this.data.mode === 'create'
				? [
						Validators.required,
						Validators.minLength(8),
						Validators.maxLength(100),
					]
				: [],
		],
		isActive: [Boolean(this.data.user?.isActive ?? true)],
	});

	constructor(
		private readonly formBuilder: FormBuilder,
		private readonly userService: UserService,
		private readonly dialogRef: MatDialogRef<UserFormDialogComponent>,
		@Inject(MAT_DIALOG_DATA)
		public readonly data: UserFormDialogData,
	) {}

	get title(): string {
		return this.data.mode === 'create' ? 'Add User' : 'Edit User';
	}

	get subtitle(): string {
		return this.data.mode === 'create'
			? 'Create a login account for Global Trans or a client company.'
			: 'Update user identity, organization, roles, and status.';
	}

	get availableDivisions() {
		const companyUuid = this.form.controls.companyUuid.value;

		return this.data.options.divisions.filter(
			(item) => item.companyUuid === companyUuid,
		);
	}

	get selectedRoleUuids(): string[] {
		return this.form.controls.roleUuids.value;
	}

	get selectedCompanyUuid(): string {
		return this.form.controls.companyUuid.value;
	}

	get availableRoles(): UserRoleOption[] {
		const companyUuid = this.selectedCompanyUuid;

		if (!companyUuid) {
			return [];
		}

		return this.data.options.roles
			.filter(
				(role) =>
					role.companyUuid === companyUuid &&
					role.code !== 'SYSTEM_DEVELOPER',
			)
			.sort((first, second) => first.name.localeCompare(second.name));
	}

	get roleGroups(): RoleGroup[] {
		const businessRoles = this.availableRoles.filter(
			(role) => !Boolean(role.isSystem),
		);

		return [
			{
				key: 'business',
				name: 'Business Roles',
				description: 'Available roles for the selected company.',
				roles: businessRoles,
			},
		].filter((group) => group.roles.length > 0);
	}

	companyChanged(): void {
		const currentDivisionUuid = this.form.controls.divisionUuid.value;

		if (
			currentDivisionUuid &&
			!this.availableDivisions.some(
				(division) => division.uuid === currentDivisionUuid,
			)
		) {
			this.form.controls.divisionUuid.setValue('');
		}

		const validRoleUuids = new Set(
			this.availableRoles.map((role) => role.uuid),
		);

		const selectedRoleUuids = this.selectedRoleUuids.filter((roleUuid) =>
			validRoleUuids.has(roleUuid),
		);

		this.updateSelectedRoles(selectedRoleUuids);
	}

	isRoleSelected(roleUuid: string): boolean {
		return this.selectedRoleUuids.includes(roleUuid);
	}

	isRoleGroupSelected(group: RoleGroup): boolean {
		return (
			group.roles.length > 0 &&
			group.roles.every((role) => this.isRoleSelected(role.uuid))
		);
	}

	isRoleGroupPartiallySelected(group: RoleGroup): boolean {
		const selectedCount = group.roles.filter((role) =>
			this.isRoleSelected(role.uuid),
		).length;

		return selectedCount > 0 && selectedCount < group.roles.length;
	}

	toggleRole(roleUuid: string, checked: boolean): void {
		const selectedRoleUuids = new Set(this.selectedRoleUuids);

		if (checked) {
			selectedRoleUuids.add(roleUuid);
		} else {
			selectedRoleUuids.delete(roleUuid);
		}

		this.updateSelectedRoles([...selectedRoleUuids]);
	}

	toggleRoleGroup(group: RoleGroup, checked: boolean): void {
		const selectedRoleUuids = new Set(this.selectedRoleUuids);

		for (const role of group.roles) {
			if (checked) {
				selectedRoleUuids.add(role.uuid);
			} else {
				selectedRoleUuids.delete(role.uuid);
			}
		}

		this.updateSelectedRoles([...selectedRoleUuids]);
	}

	hasError(controlName: keyof typeof this.form.controls): boolean {
		const control = this.form.controls[controlName];
		return control.invalid && (control.dirty || control.touched);
	}

	save(): void {
		if (this.form.invalid || this.isSaving) {
			this.form.markAllAsTouched();
			return;
		}

		const value = this.form.getRawValue();

		const payload: UserPayload = {
			fullName: value.fullName.trim(),
			email: value.email.trim().toLowerCase(),
			phone: value.phone.trim() || null,
			companyUuid: value.companyUuid,
			divisionUuid: value.divisionUuid || null,
			roleUuids: value.roleUuids,
			isActive: value.isActive,
		};

		if (this.data.mode === 'create') {
			payload.password = value.password;
		}

		this.isSaving = true;
		this.errorMessage = '';

		const request =
			this.data.mode === 'create'
				? this.userService.createUser(payload)
				: this.userService.updateUser(this.data.user!.uuid, payload);

		request.pipe(finalize(() => (this.isSaving = false))).subscribe({
			next: () => {
				this.dialogRef.close({
					action: 'save',
					mode: this.data.mode,
				});
			},
			error: (error) => {
				this.errorMessage =
					error?.error?.meta?.message ?? 'Failed to save user.';
			},
		});
	}

	cancel(): void {
		if (!this.isSaving) {
			this.dialogRef.close();
		}
	}

	trackByRoleUuid(_: number, role: UserRoleOption): string {
		return role.uuid;
	}

	trackByRoleGroup(_: number, group: RoleGroup): string {
		return group.key;
	}

	private updateSelectedRoles(roleUuids: string[]): void {
		this.form.controls.roleUuids.setValue(roleUuids);
		this.form.controls.roleUuids.markAsDirty();
		this.form.controls.roleUuids.markAsTouched();
	}
}
