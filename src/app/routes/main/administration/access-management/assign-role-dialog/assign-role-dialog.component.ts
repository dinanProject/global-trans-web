import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import {
	AccessManagementService,
	AccessUser,
	AssignableRole,
	UserRoleDetail,
} from '../access-management.service';
import { takeUntil } from 'rxjs';

export interface AssignRoleDialogData {
	user: AccessUser;
}

interface ApiResponse<T> {
	data: T;
	meta?: {
		message?: string;
	};
}

@Component({
	selector: 'app-assign-role-dialog',
	templateUrl: './assign-role-dialog.component.html',
	styleUrls: ['./assign-role-dialog.component.scss'],
	standalone: false,
})
export class AssignRoleDialogComponent implements OnInit {
	form: FormGroup<{
		roleUuids: FormControl<string[]>;
	}>;

	roles: AssignableRole[] = [];

	search = '';
	isLoading = false;
	isSaving = false;
	errorMessage = '';

	constructor(
		private formBuilder: FormBuilder,
		private accessManagementService: AccessManagementService,
		private dialogRef: MatDialogRef<AssignRoleDialogComponent>,
		@Inject(MAT_DIALOG_DATA)
		public data: AssignRoleDialogData,
	) {
		this.form = this.formBuilder.nonNullable.group({
			roleUuids: [[] as string[]],
		});
	}

	ngOnInit(): void {
		this.loadRoles();
	}

	get filteredRoles(): AssignableRole[] {
		const keyword = this.search.trim().toLowerCase();

		if (!keyword) {
			return this.roles;
		}

		return this.roles.filter((role) => {
			return (
				role.code.toLowerCase().includes(keyword) ||
				role.name.toLowerCase().includes(keyword) ||
				(role.description || '').toLowerCase().includes(keyword)
			);
		});
	}

	get selectedRoleUuids(): string[] {
		return this.form.controls.roleUuids.value;
	}

	isSelected(roleUuid: string): boolean {
		return this.selectedRoleUuids.includes(roleUuid);
	}

	toggleRole(roleUuid: string, checked: boolean): void {
		const selected = new Set(this.selectedRoleUuids);

		if (checked) {
			selected.add(roleUuid);
		} else {
			selected.delete(roleUuid);
		}

		this.form.controls.roleUuids.setValue([...selected]);
		this.form.controls.roleUuids.markAsDirty();
	}

	selectAll(): void {
		this.form.controls.roleUuids.setValue(
			this.roles.map((role) => role.uuid),
		);
		this.form.controls.roleUuids.markAsDirty();
	}

	clearAll(): void {
		this.form.controls.roleUuids.setValue([]);
		this.form.controls.roleUuids.markAsDirty();
	}

	private loadRoles(): void {
		this.isLoading = true;
		this.errorMessage = '';

		this.accessManagementService
			.getUserRoles(this.data.user.uuid)
			.subscribe({
				next: (result: UserRoleDetail) => {
					this.roles = result?.roles ?? [];

					this.form.controls.roleUuids.setValue(
						this.roles
							.filter((role) => role.assigned)
							.map((role) => role.uuid),
					);

					this.form.markAsPristine();
					this.isLoading = false;
				},
				error: (error) => {
					this.roles = [];
					this.isLoading = false;

					this.errorMessage =
						error?.error?.meta?.message ?? 'Failed to load roles.';
				},
			});
	}

	save(): void {
		if (this.isSaving) {
			return;
		}

		this.isSaving = true;
		this.errorMessage = '';

		this.accessManagementService
			.updateUserRoles(this.data.user.uuid, {
				roleUuids: this.selectedRoleUuids,
			})
			.subscribe({
				next: () => {
					this.isSaving = false;
					this.dialogRef.close({
						action: 'save',
					});
				},
				error: (error) => {
					this.errorMessage =
						error?.error?.meta?.message ||
						'Failed to update user roles.';

					this.isSaving = false;
				},
			});
	}

	cancel(): void {
		this.dialogRef.close();
	}
}
