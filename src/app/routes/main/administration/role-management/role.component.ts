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

import { ManagePermissionDialogComponent } from '../access-management/manage-permission-dialog/manage-permission-dialog.component';
import { RoleSummary } from '../access-management/access-management.service';
import {
	RoleFormDialogComponent,
	RoleFormDialogData,
} from './role-form-dialog/role-form-dialog.component';
import { RoleCompanyOption, RoleMaster, RoleService } from './role.service';
import { UtilityService } from 'src/app/shared/utility/utility.service';
import { SessionService } from 'src/app/core/services/session.service';

@Component({
	selector: 'app-role',
	templateUrl: './role.component.html',
	styleUrls: ['./role.component.scss'],
	standalone: false,
})
export class RoleComponent implements OnInit, OnDestroy {
	private readonly destroy$ = new Subject<void>();

	readonly searchControl = new FormControl('', { nonNullable: true });
	readonly statusControl = new FormControl<'all' | 'active' | 'inactive'>(
		'all',
		{
			nonNullable: true,
		},
	);

	roles: RoleMaster[] = [];
	filteredRoles: RoleMaster[] = [];
	companies: RoleCompanyOption[] = [];
	isLoading = false;
	deletingUuid = '';
	errorMessage = '';

	constructor(
		private readonly roleService: RoleService,
		private utilityService: UtilityService,
		private sessionService: SessionService,
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

		this.statusControl.valueChanges
			.pipe(takeUntil(this.destroy$))
			.subscribe(() => this.applyFilters());

		this.loadRoleOptions();
		this.loadRoles();
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	private loadRoleOptions(): void {
		this.roleService
			.getOptions()
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (result) => {
					this.companies = result?.companies ?? [];
				},
				error: (error) => {
					this.companies = [];

					this.utilityService.alert(
						'Failed',
						error?.error?.meta?.message ??
							'Failed to load company options.',
						'error',
					);
				},
			});
	}

	loadRoles(): void {
		this.isLoading = true;
		this.errorMessage = '';

		this.roleService
			.getRoles()
			.pipe(
				takeUntil(this.destroy$),
				finalize(() => (this.isLoading = false)),
			)
			.subscribe({
				next: (roles) => {
					console.log(roles);
					this.roles = roles ?? [];
					this.applyFilters();
				},
				error: (error) => {
					this.roles = [];
					this.filteredRoles = [];
					this.errorMessage =
						error?.error?.meta?.message ?? 'Failed to load roles.';
				},
			});
	}

	get isSystemDeveloper(): boolean {
		return this.sessionService.isSystemDeveloper();
	}

	canEditRole(role: RoleMaster): boolean {
		return Number(role.isSystem) !== 1 || this.isSystemDeveloper;
	}

	canManagePermissions(role: RoleMaster): boolean {
		return Number(role.isSystem) !== 1 || this.isSystemDeveloper;
	}

	canDeactivateRole(role: RoleMaster): boolean {
		return Number(role.isSystem) !== 1;
	}

	resetFilters(): void {
		this.searchControl.setValue('', { emitEvent: false });
		this.statusControl.setValue('all', { emitEvent: false });
		this.applyFilters();
	}

	openCreateDialog(): void {
		this.openRoleDialog({
			mode: 'create',
		});
	}

	openEditDialog(role: RoleMaster): void {
		this.openRoleDialog({
			mode: 'edit',
			role,
		});
	}

	openPermissionDialog(role: RoleMaster): void {
		const roleSummary: RoleSummary = {
			...role,
			permissionCount: role.permissionCount ?? 0,
			userCount: role.userCount ?? 0,
		};

		const dialogRef = this.dialog.open(ManagePermissionDialogComponent, {
			width: '1180px',
			maxWidth: '96vw',
			maxHeight: '94vh',
			disableClose: true,
			autoFocus: false,
			panelClass: 'manage-permission-dialog-panel',
			data: { role: roleSummary },
		});

		dialogRef
			.afterClosed()
			.pipe(takeUntil(this.destroy$))
			.subscribe((result) => {
				if (result?.action === 'save') {
					this.loadRoles();
				}
			});
	}

	async deleteRole(role: RoleMaster): Promise<void> {
		const confirmed = await this.utilityService.confirm(
			'Deactivate Role',
			`Deactivate role "${role.name}"?`,
			'warning',
		);

		if (!confirmed) {
			return;
		}

		this.roleService.deleteRole(role.uuid).subscribe({
			next: () => {
				this.utilityService.alert(
					'Success',
					`Role "${role.name}" berhasil dinonaktifkan.`,
					'success',
				);

				this.loadRoles();
			},
			error: (error) => {
				this.utilityService.alert(
					'Failed',
					error?.error?.message ||
						`Role "${role.name}" gagal dinonaktifkan.`,
					'error',
				);
			},
		});
	}
	trackByUuid(_: number, role: RoleMaster): string {
		return role.uuid;
	}

	private openRoleDialog(data: Omit<RoleFormDialogData, 'companies'>): void {
		const dialogRef = this.dialog.open(RoleFormDialogComponent, {
			width: '680px',
			maxWidth: '95vw',
			disableClose: true,
			autoFocus: false,
			data: {
				...data,
				companies: this.companies,
			},
		});

		dialogRef
			.afterClosed()
			.pipe(takeUntil(this.destroy$))
			.subscribe((result) => {
				if (result?.action !== 'save') {
					return;
				}
				this.utilityService.alert(
					'Success',
					data.mode === 'create'
						? 'Role berhasil dibuat.'
						: 'Role berhasil diperbarui.',
					'success',
				);
				this.loadRoles();
			});
	}

	private applyFilters(): void {
		const keyword = this.searchControl.value.trim().toLowerCase();
		const status = this.statusControl.value;

		this.filteredRoles = this.roles
			.filter((role) => {
				const active = Boolean(role.isActive);
				if (status === 'active' && !active) return false;
				if (status === 'inactive' && active) return false;
				if (!keyword) return true;

				return [role.name, role.code, role.description]
					.filter(Boolean)
					.join(' ')
					.toLowerCase()
					.includes(keyword);
			})
			.sort((a, b) => a.name.localeCompare(b.name));
	}
}
