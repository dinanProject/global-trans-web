import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subject, finalize, takeUntil } from 'rxjs';

import {
	AccessManagementService,
	AccessPermission,
	RolePermissionDetail,
	RoleSummary,
} from '../access-management.service';

export interface ManagePermissionDialogData {
	role: RoleSummary;
}

interface PermissionGroup {
	module: string;
	permissions: AccessPermission[];
}

@Component({
	selector: 'app-manage-permission-dialog',
	templateUrl: './manage-permission-dialog.component.html',
	styleUrls: ['./manage-permission-dialog.component.scss'],
	standalone: false,
})
export class ManagePermissionDialogComponent implements OnInit, OnDestroy {
	private readonly destroy$ = new Subject<void>();
	private readonly expandedModules = new Set<string>();

	form: FormGroup<{
		permissionUuids: FormControl<string[]>;
	}>;

	searchControl = new FormControl('', {
		nonNullable: true,
	});

	permissions: AccessPermission[] = [];

	isLoading = false;
	isSaving = false;
	errorMessage = '';

	constructor(
		private readonly formBuilder: FormBuilder,
		private readonly accessManagementService: AccessManagementService,
		private readonly dialogRef: MatDialogRef<ManagePermissionDialogComponent>,
		@Inject(MAT_DIALOG_DATA)
		public readonly data: ManagePermissionDialogData,
	) {
		this.form = this.formBuilder.nonNullable.group({
			permissionUuids: [[] as string[]],
		});
	}

	ngOnInit(): void {
		this.loadPermissions();
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	get search(): string {
		return this.searchControl.value;
	}

	get selectedPermissionUuids(): string[] {
		return this.form.controls.permissionUuids.value;
	}

	get selectedPermissionCount(): number {
		return this.selectedPermissionUuids.length;
	}

	get permissionGroups(): PermissionGroup[] {
		const keyword = this.search.trim().toLowerCase();

		const filteredPermissions = keyword
			? this.permissions.filter((permission) => {
					const searchableValue = [
						permission.code,
						permission.label,
						permission.module,
						permission.action,
						permission.scope,
						permission.description,
					]
						.filter(Boolean)
						.join(' ')
						.toLowerCase();

					return searchableValue.includes(keyword);
				})
			: this.permissions;

		const groupedPermissions = new Map<string, AccessPermission[]>();

		for (const permission of filteredPermissions) {
			const moduleName =
				permission.module?.trim().toUpperCase() || 'GENERAL';

			const permissions = groupedPermissions.get(moduleName) ?? [];

			permissions.push(permission);
			groupedPermissions.set(moduleName, permissions);
		}

		return Array.from(groupedPermissions.entries())
			.map(([module, permissions]) => ({
				module,
				permissions: [...permissions].sort((first, second) => {
					const firstLabel = first.label || first.code || '';

					const secondLabel = second.label || second.code || '';

					return firstLabel.localeCompare(secondLabel);
				}),
			}))
			.sort((first, second) => first.module.localeCompare(second.module));
	}

	get visiblePermissionCount(): number {
		return this.permissionGroups.reduce(
			(total, group) => total + group.permissions.length,
			0,
		);
	}

	get isAllPermissionsSelected(): boolean {
		return (
			this.permissions.length > 0 &&
			this.permissions.every((permission) =>
				this.isSelected(permission.uuid),
			)
		);
	}

	get isPartiallySelected(): boolean {
		return (
			this.selectedPermissionCount > 0 && !this.isAllPermissionsSelected
		);
	}

	isSelected(permissionUuid: string): boolean {
		return this.selectedPermissionUuids.includes(permissionUuid);
	}

	togglePermission(permissionUuid: string, checked: boolean): void {
		const selectedUuids = new Set(this.selectedPermissionUuids);

		if (checked) {
			selectedUuids.add(permissionUuid);
		} else {
			selectedUuids.delete(permissionUuid);
		}

		this.updateSelectedPermissions([...selectedUuids]);
	}

	isGroupExpanded(group: PermissionGroup): boolean {
		if (this.search.trim()) {
			return true;
		}

		return this.expandedModules.has(group.module);
	}

	toggleGroupExpansion(group: PermissionGroup): void {
		if (this.expandedModules.has(group.module)) {
			this.expandedModules.delete(group.module);
			return;
		}

		this.expandedModules.add(group.module);
	}

	isGroupSelected(group: PermissionGroup): boolean {
		return (
			group.permissions.length > 0 &&
			group.permissions.every((permission) =>
				this.isSelected(permission.uuid),
			)
		);
	}

	isGroupPartiallySelected(group: PermissionGroup): boolean {
		const selectedCount = this.getGroupSelectedCount(group);

		return selectedCount > 0 && selectedCount < group.permissions.length;
	}

	getGroupSelectedCount(group: PermissionGroup): number {
		return group.permissions.filter((permission) =>
			this.isSelected(permission.uuid),
		).length;
	}

	toggleGroup(group: PermissionGroup, checked: boolean): void {
		const selectedUuids = new Set(this.selectedPermissionUuids);

		for (const permission of group.permissions) {
			if (checked) {
				selectedUuids.add(permission.uuid);
			} else {
				selectedUuids.delete(permission.uuid);
			}
		}

		this.updateSelectedPermissions([...selectedUuids]);
	}

	toggleAllPermissions(checked: boolean): void {
		if (checked) {
			this.selectAll();
			return;
		}

		this.clearAll();
	}

	selectAll(): void {
		this.updateSelectedPermissions(
			this.permissions.map((permission) => permission.uuid),
		);
	}

	clearAll(): void {
		this.updateSelectedPermissions([]);
	}

	expandAll(): void {
		for (const group of this.permissionGroups) {
			this.expandedModules.add(group.module);
		}
	}

	collapseAll(): void {
		this.expandedModules.clear();
	}

	clearSearch(): void {
		this.searchControl.setValue('');
	}

	loadPermissions(): void {
		this.isLoading = true;
		this.errorMessage = '';

		this.accessManagementService
			.getRolePermissions(this.data.role.uuid)
			.pipe(
				takeUntil(this.destroy$),
				finalize(() => {
					this.isLoading = false;
				}),
			)
			.subscribe({
				next: (result: RolePermissionDetail) => {
					const permissions = result?.permissions ?? [];

					this.permissions =
						this.data.role.code === 'SYSTEM_DEVELOPER'
							? permissions
							: permissions.filter(
									(permission) =>
										permission.module
											?.trim()
											.toUpperCase() !== 'PERMISSION',
								);

					const assignedPermissionUuids = this.permissions

						.filter((permission) => permission.assigned)
						.map((permission) => permission.uuid);
					this.form.controls.permissionUuids.setValue(
						assignedPermissionUuids,
					);

					this.form.markAsPristine();
					this.expandedModules.clear();

					const firstGroup = this.permissionGroups[0];

					if (firstGroup) {
						this.expandedModules.add(firstGroup.module);
					}
				},
				error: (error) => {
					this.permissions = [];

					this.form.controls.permissionUuids.setValue([]);
					this.form.markAsPristine();

					this.errorMessage =
						error?.error?.meta?.message ??
						'Failed to load permissions.';
				},
			});
	}

	save(): void {
		if (this.isLoading || this.isSaving || this.form.pristine) {
			return;
		}

		this.isSaving = true;
		this.errorMessage = '';

		this.accessManagementService
			.updateRolePermissions(this.data.role.uuid, {
				permissionUuids: this.selectedPermissionUuids,
			})
			.pipe(
				takeUntil(this.destroy$),
				finalize(() => {
					this.isSaving = false;
				}),
			)
			.subscribe({
				next: () => {
					this.dialogRef.close({
						action: 'save',
					});
				},
				error: (error) => {
					this.errorMessage =
						error?.error?.meta?.message ??
						'Failed to update role permissions.';
				},
			});
	}

	cancel(): void {
		if (this.isSaving) {
			return;
		}

		this.dialogRef.close();
	}

	trackByModule(index: number, group: PermissionGroup): string {
		return group.module;
	}

	trackByPermissionUuid(index: number, permission: AccessPermission): string {
		return permission.uuid;
	}

	private updateSelectedPermissions(permissionUuids: string[]): void {
		this.form.controls.permissionUuids.setValue(permissionUuids);
		this.form.controls.permissionUuids.markAsDirty();
	}
}
