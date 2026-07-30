import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

import { PermissionOption } from '../menu-management.service';

export interface PermissionPickerDialogData {
	permissions: PermissionOption[];
	selectedPermissionId: number | null;
}

export interface PermissionPickerDialogResult {
	permission: PermissionOption | null;
}

@Component({
	selector: 'app-permission-picker-dialog',
	templateUrl: './permission-picker-dialog.component.html',
	styleUrls: ['./permission-picker-dialog.component.scss'],
	standalone: false,
})
export class PermissionPickerDialogComponent implements OnInit, OnDestroy {
	private readonly destroy$ = new Subject<void>();

	search = new FormControl('', {
		nonNullable: true,
	});

	permissions: PermissionOption[] = [];
	filteredPermissions: PermissionOption[] = [];

	selectedPermissionId: number | null = null;

	displayedColumns = ['select', 'code', 'label'];

	constructor(
		private dialogRef: MatDialogRef<
			PermissionPickerDialogComponent,
			PermissionPickerDialogResult
		>,

		@Inject(MAT_DIALOG_DATA)
		public data: PermissionPickerDialogData,
	) {
		this.permissions = [...(data.permissions ?? [])].sort((a, b) =>
			a.code.localeCompare(b.code),
		);

		this.filteredPermissions = [...this.permissions];
		this.selectedPermissionId = data.selectedPermissionId ?? null;
	}

	ngOnInit(): void {
		this.search.valueChanges
			.pipe(
				debounceTime(200),
				distinctUntilChanged(),
				takeUntil(this.destroy$),
			)
			.subscribe(() => {
				this.filterPermissions();
			});
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	selectPermission(permission: PermissionOption): void {
		this.selectedPermissionId = permission.permissionId;
	}

	selectNoPermission(): void {
		this.selectedPermissionId = null;
	}

	isSelected(permission: PermissionOption): boolean {
		return this.selectedPermissionId === permission.permissionId;
	}

	save(): void {
		const selectedPermission =
			this.selectedPermissionId === null
				? null
				: (this.permissions.find(
						(permission) =>
							permission.permissionId ===
							this.selectedPermissionId,
					) ?? null);

		this.dialogRef.close({
			permission: selectedPermission,
		});
	}

	cancel(): void {
		this.dialogRef.close();
	}

	trackByPermissionId(index: number, permission: PermissionOption): number {
		return permission.permissionId;
	}

	private filterPermissions(): void {
		const searchValue = this.search.value.trim().toLowerCase();

		if (!searchValue) {
			this.filteredPermissions = [...this.permissions];
			return;
		}

		this.filteredPermissions = this.permissions.filter((permission) => {
			const searchableValue = [permission.code, permission.label]
				.filter(Boolean)
				.join(' ')
				.toLowerCase();

			return searchableValue.includes(searchValue);
		});
	}
}
