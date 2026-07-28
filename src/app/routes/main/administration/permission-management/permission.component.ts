import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import {
	Subject,
	debounceTime,
	distinctUntilChanged,
	finalize,
	takeUntil,
} from 'rxjs';

import {
	PermissionFormDialogComponent,
	PermissionFormDialogData,
} from './permission-form-dialog/permission-form-dialog.component';
import { PermissionMaster, PermissionService } from './permission.service';
import { UtilityService } from 'src/app/shared/utility/utility.service';

@Component({
	selector: 'app-permission',
	templateUrl: './permission.component.html',
	styleUrls: ['./permission.component.scss'],
	standalone: false,
})
export class PermissionComponent implements OnInit, OnDestroy {
	private readonly destroy$ = new Subject<void>();

	readonly searchControl = new FormControl('', { nonNullable: true });
	readonly moduleControl = new FormControl('all', { nonNullable: true });
	readonly statusControl = new FormControl<'all' | 'active' | 'inactive'>(
		'all',
		{
			nonNullable: true,
		},
	);

	permissions: PermissionMaster[] = [];
	filteredPermissions: PermissionMaster[] = [];
	isLoading = false;
	deletingUuid = '';
	errorMessage = '';

	displayedColumns: string[] = [
		'permission',
		'code',
		'access',
		'policy',
		'status',
		'actions',
	];

	constructor(
		private readonly permissionService: PermissionService,
		private utilityService: UtilityService,
		private readonly dialog: MatDialog,
	) {}

	ngOnInit(): void {
		this.searchControl.valueChanges
			.pipe(
				debounceTime(250),
				distinctUntilChanged(),
				takeUntil(this.destroy$),
			)
			.subscribe(() => this.applyFilters());
		this.moduleControl.valueChanges
			.pipe(takeUntil(this.destroy$))
			.subscribe(() => this.applyFilters());
		this.statusControl.valueChanges
			.pipe(takeUntil(this.destroy$))
			.subscribe(() => this.applyFilters());
		this.loadPermissions();
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	get modules(): string[] {
		return Array.from(
			new Set(
				this.permissions
					.map((permission) => permission.module?.trim())
					.filter((module): module is string => Boolean(module)),
			),
		).sort((a, b) => a.localeCompare(b));
	}

	loadPermissions(): void {
		this.isLoading = true;
		this.errorMessage = '';

		this.permissionService
			.getPermissions()
			.pipe(
				takeUntil(this.destroy$),
				finalize(() => (this.isLoading = false)),
			)
			.subscribe({
				next: (permissions) => {
					this.permissions = permissions ?? [];
					this.applyFilters();
				},
				error: (error) => {
					this.permissions = [];
					this.filteredPermissions = [];
					this.errorMessage =
						error?.error?.meta?.message ??
						'Failed to load permissions.';
				},
			});
	}

	resetFilters(): void {
		this.searchControl.setValue('', { emitEvent: false });
		this.moduleControl.setValue('all', { emitEvent: false });
		this.statusControl.setValue('all', { emitEvent: false });
		this.applyFilters();
	}

	openCreateDialog(): void {
		this.openPermissionDialog({ mode: 'create' });
	}

	openEditDialog(permission: PermissionMaster): void {
		this.openPermissionDialog({ mode: 'edit', permission });
	}

	async deletePermission(permission: PermissionMaster): Promise<void> {
		const confirmed = await this.utilityService.confirm(
			'Deactivate Permission',
			`Deactivate permission "${permission.label}"?`,
			'warning',
		);

		if (!confirmed) {
			return;
		}

		this.permissionService.deletePermission(permission.uuid).subscribe({
			next: () => {
				this.utilityService.alert(
					'Success',
					`Permission "${permission.label}" berhasil dinonaktifkan.`,
					'success',
				);

				this.loadPermissions();
			},
			error: (error) => {
				this.utilityService.alert(
					'Failed',
					error?.error?.message ||
						`Permission "${permission.label}" gagal dinonaktifkan.`,
					'error',
				);
			},
		});
	}

	trackByUuid(_: number, permission: PermissionMaster): string {
		return permission.uuid;
	}

	private openPermissionDialog(data: PermissionFormDialogData): void {
		const dialogRef = this.dialog.open(PermissionFormDialogComponent, {
			width: '720px',
			maxWidth: '95vw',
			disableClose: true,
			autoFocus: false,
			data,
		});

		dialogRef
			.afterClosed()
			.pipe(takeUntil(this.destroy$))
			.subscribe((result) => {
				if (result?.action === 'save') {
					this.loadPermissions();
				}
			});
	}

	private applyFilters(): void {
		const keyword = this.searchControl.value.trim().toLowerCase();
		const selectedModule = this.moduleControl.value;
		const selectedStatus = this.statusControl.value;

		this.filteredPermissions = this.permissions
			.filter((permission) => {
				if (
					selectedModule !== 'all' &&
					permission.module !== selectedModule
				) {
					return false;
				}

				const active = Boolean(permission.isActive);
				if (selectedStatus === 'active' && !active) return false;
				if (selectedStatus === 'inactive' && active) return false;
				if (!keyword) return true;

				return [
					permission.label,
					permission.code,
					permission.module,
					permission.action,
					permission.scope,
					permission.description,
				]
					.filter(Boolean)
					.join(' ')
					.toLowerCase()
					.includes(keyword);
			})
			.sort((a, b) => {
				const moduleComparison = a.module.localeCompare(b.module);
				return moduleComparison || a.label.localeCompare(b.label);
			});
	}
}
