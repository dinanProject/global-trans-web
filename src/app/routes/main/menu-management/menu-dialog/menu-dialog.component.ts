import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
	MAT_DIALOG_DATA,
	MatDialog,
	MatDialogRef,
} from '@angular/material/dialog';

import {
	Menu,
	MenuDialogData,
	MenuDialogResult,
	MenuPayload,
	PermissionOption,
} from '../menu-management.service';

import {
	PermissionPickerDialogComponent,
	PermissionPickerDialogData,
	PermissionPickerDialogResult,
} from '../permission-picker-dialog/permission-picker-dialog.component';
import { UtilityService } from 'src/app/shared/utility/utility.service';

@Component({
	selector: 'app-menu-dialog',
	templateUrl: './menu-dialog.component.html',
	styleUrls: ['./menu-dialog.component.scss'],
	standalone: false,
})
export class MenuDialogComponent {
	form: FormGroup;

	isEditMode = false;

	constructor(
		private formBuilder: FormBuilder,
		private dialog: MatDialog,
		private dialogRef: MatDialogRef<MenuDialogComponent, MenuDialogResult>,
		@Inject(MAT_DIALOG_DATA)
		public data: MenuDialogData,
		private utilityService: UtilityService,
	) {
		this.isEditMode = data.mode === 'edit';

		this.form = this.formBuilder.group({
			parentUuid: [this.getInitialParentUuid()],
			code: [
				data.menu?.code ?? '',
				[Validators.required, Validators.maxLength(100)],
			],
			menuName: [
				data.menu?.menuName ?? '',
				[Validators.required, Validators.maxLength(150)],
			],
			route: [data.menu?.route ?? '', Validators.maxLength(255)],
			icon: [data.menu?.icon ?? '', Validators.maxLength(100)],
			permissionId: [data.menu?.permissionId ?? null],
			sequence: [
				data.menu?.sequence ?? 0,
				[Validators.required, Validators.min(0)],
			],
			isActive: [data.menu?.isActive ?? true],
		});
	}

	get dialogTitle(): string {
		return this.isEditMode ? 'Edit Menu' : 'Add Menu';
	}

	get availableParentMenus(): Menu[] {
		const editedMenuId = this.data.menu?.menuId ?? null;

		return (this.data.menus ?? [])
			.filter((menu) => {
				if (editedMenuId === null) {
					return true;
				}

				return menu.menuId !== editedMenuId;
			})
			.sort((a, b) => {
				if (a.sequence !== b.sequence) {
					return a.sequence - b.sequence;
				}

				return a.menuName.localeCompare(b.menuName);
			});
	}

	get selectedPermission(): PermissionOption | null {
		const permissionId = this.form.get('permissionId')?.value ?? null;

		if (permissionId === null) {
			return null;
		}

		return (
			(this.data.permissions ?? []).find(
				(permission) => permission.permissionId === permissionId,
			) ?? null
		);
	}

	get selectedPermissionDisplay(): string {
		const permission = this.selectedPermission;

		if (!permission) {
			return '';
		}

		return `${permission.code} - ${permission.label}`;
	}

	// openPermissionDialog(): void {
	// 	const dialogRef = this.dialog.open<
	// 		PermissionPickerDialogComponent,
	// 		PermissionPickerDialogData,
	// 		PermissionPickerDialogResult
	// 	>(PermissionPickerDialogComponent, {
	// 		width: '780px',
	// 		maxWidth: '95vw',
	// 		disableClose: true,
	// 		data: {
	// 			permissions: this.data.permissions ?? [],
	// 			selectedPermissionId:
	// 				this.form.get('permissionId')?.value ?? null,
	// 		},
	// 	});

	// 	dialogRef.afterClosed().subscribe((result) => {
	// 		if (!result) {
	// 			return;
	// 		}

	// 		const permission = result.permission;

	// 		if (permission) {
	// 			const usedMenu = (this.data.menus ?? []).find((menu) => {
	// 				const isCurrentMenu =
	// 					this.data.mode === 'edit' &&
	// 					menu.menuId === this.data.menu?.menuId;

	// 				return (
	// 					!isCurrentMenu &&
	// 					menu.permissionId === permission.permissionId
	// 				);
	// 			});

	// 			if (usedMenu) {
	// 				this.utilityService.alert(
	// 					'Permission Already Used',
	// 					`Permission "${permission.code}" sudah digunakan oleh menu "${usedMenu.menuName}".`,
	// 					'warning',
	// 				);

	// 				return;
	// 			}
	// 		}

	// 		this.form.patchValue({
	// 			permissionId: permission?.permissionId ?? null,
	// 		});

	// 		this.form.get('permissionId')?.markAsDirty();
	// 		this.form.get('permissionId')?.markAsTouched();
	// 	});
	// }
	openPermissionDialog(): void {
		const currentMenuId = this.data.menu?.menuId ?? null;
		const currentPermissionId =
			this.form.get('permissionId')?.value ?? null;

		const usedPermissionIds = new Set(
			(this.data.menus ?? [])
				.filter((menu) => menu.menuId !== currentMenuId)
				.map((menu) => menu.permissionId)
				.filter(
					(permissionId): permissionId is number =>
						permissionId !== null,
				),
		);

		const availablePermissions = (this.data.permissions ?? []).filter(
			(permission) =>
				permission.permissionId === currentPermissionId ||
				!usedPermissionIds.has(permission.permissionId),
		);

		const dialogRef = this.dialog.open<
			PermissionPickerDialogComponent,
			PermissionPickerDialogData,
			PermissionPickerDialogResult
		>(PermissionPickerDialogComponent, {
			width: '780px',
			maxWidth: '95vw',
			disableClose: true,
			data: {
				permissions: availablePermissions,
				selectedPermissionId: currentPermissionId,
			},
		});

		dialogRef.afterClosed().subscribe((result) => {
			if (!result) {
				return;
			}

			this.form.patchValue({
				permissionId: result.permission?.permissionId ?? null,
			});

			this.form.get('permissionId')?.markAsDirty();
			this.form.get('permissionId')?.markAsTouched();
		});
	}

	clearPermission(event?: Event): void {
		event?.stopPropagation();

		this.form.patchValue({
			permissionId: null,
		});

		this.form.get('permissionId')?.markAsDirty();
		this.form.get('permissionId')?.markAsTouched();
	}

	save(): void {
		if (this.form.invalid) {
			this.form.markAllAsTouched();
			return;
		}

		const formValue = this.form.getRawValue();

		const payload: MenuPayload = {
			parentUuid: this.normalizeNullableString(formValue.parentUuid),
			code: this.normalizeString(formValue.code).toUpperCase(),
			menuName: this.normalizeString(formValue.menuName),
			route: this.normalizeNullableString(formValue.route),
			icon: this.normalizeNullableString(formValue.icon),
			permissionId:
				formValue.permissionId === null ||
				formValue.permissionId === undefined ||
				formValue.permissionId === ''
					? null
					: Number(formValue.permissionId),
			sequence: Number(formValue.sequence),
			isActive: Boolean(formValue.isActive),
		};

		this.dialogRef.close({
			action: 'save',
			payload,
		});
	}

	cancel(): void {
		this.dialogRef.close();
	}

	private getInitialParentUuid(): string | null {
		if (this.data.mode === 'edit') {
			return this.data.menu?.parentUuid ?? null;
		}

		return this.data.parentMenu?.uuid ?? null;
	}

	private normalizeString(value: unknown): string {
		if (typeof value !== 'string') {
			return '';
		}

		return value.trim();
	}

	private normalizeNullableString(value: unknown): string | null {
		const normalizedValue = this.normalizeString(value);

		return normalizedValue || null;
	}
}
