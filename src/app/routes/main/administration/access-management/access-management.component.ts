import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import {
	Subject,
	catchError,
	debounceTime,
	distinctUntilChanged,
	finalize,
	forkJoin,
	of,
	takeUntil,
} from 'rxjs';

import {
	AccessManagementService,
	AccessUser,
	RoleSummary,
} from './access-management.service';

import {
	AssignRoleDialogComponent,
	AssignRoleDialogData,
} from './assign-role-dialog/assign-role-dialog.component';

import {
	ManagePermissionDialogComponent,
	ManagePermissionDialogData,
} from './manage-permission-dialog/manage-permission-dialog.component';

type UserStatusFilter = 'all' | 'active' | 'inactive';

@Component({
	selector: 'app-access-management',
	templateUrl: './access-management.component.html',
	styleUrls: ['./access-management.component.scss'],
	standalone: false,
})
export class AccessManagementComponent implements OnInit, OnDestroy {
	private readonly destroy$ = new Subject<void>();

	selectedTabIndex = 0;

	userSearch = new FormControl('', {
		nonNullable: true,
	});

	userStatus = new FormControl<UserStatusFilter>('all', {
		nonNullable: true,
	});

	roleSearch = new FormControl('', {
		nonNullable: true,
	});

	users: AccessUser[] = [];
	filteredUsers: AccessUser[] = [];

	roles: RoleSummary[] = [];
	filteredRoles: RoleSummary[] = [];

	isLoadingUsers = false;
	isLoadingRoles = false;

	userErrorMessage = '';
	roleErrorMessage = '';

	userDisplayedColumns = [
		'user',
		'email',
		'company',
		'division',
		'roles',
		'status',
		'actions',
	];

	roleDisplayedColumns = [
		'role',
		'code',
		'description',
		'permissionCount',
		'userCount',
		'actions',
	];

	constructor(
		private dialog: MatDialog,
		private accessManagementService: AccessManagementService,
	) {}

	ngOnInit(): void {
		this.userSearch.valueChanges
			.pipe(
				debounceTime(250),
				distinctUntilChanged(),
				takeUntil(this.destroy$),
			)
			.subscribe(() => this.applyUserFilters());

		this.userStatus.valueChanges
			.pipe(takeUntil(this.destroy$))
			.subscribe(() => this.applyUserFilters());

		this.roleSearch.valueChanges
			.pipe(
				debounceTime(250),
				distinctUntilChanged(),
				takeUntil(this.destroy$),
			)
			.subscribe(() => this.applyRoleFilters());

		this.loadData();
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	loadData(): void {
		this.isLoadingUsers = true;
		this.isLoadingRoles = true;

		this.userErrorMessage = '';
		this.roleErrorMessage = '';

		forkJoin({
			users: this.accessManagementService.getUsers().pipe(
				catchError((error) => {
					this.userErrorMessage =
						error?.error?.meta?.message ?? 'Failed to load users.';

					return of([]);
				}),
			),
			roles: this.accessManagementService.getRoles().pipe(
				catchError((error) => {
					this.roleErrorMessage =
						error?.error?.meta?.message ?? 'Failed to load roles.';

					return of([]);
				}),
			),
		})
			.pipe(
				takeUntil(this.destroy$),
				finalize(() => {
					this.isLoadingUsers = false;
					this.isLoadingRoles = false;
				}),
			)
			.subscribe({
				next: ({ users, roles }) => {
					this.users = users ?? [];
					this.roles = roles ?? [];

					this.applyUserFilters();
					this.applyRoleFilters();
				},
			});
	}

	loadUsers(): void {
		this.isLoadingUsers = true;
		this.userErrorMessage = '';

		this.accessManagementService
			.getUsers()
			.pipe(
				takeUntil(this.destroy$),
				finalize(() => {
					this.isLoadingUsers = false;
				}),
			)
			.subscribe({
				next: (users) => {
					this.users = users ?? [];
					this.applyUserFilters();
				},
				error: (error) => {
					this.userErrorMessage =
						error?.error?.meta?.message ?? 'Failed to load users.';

					this.users = [];
					this.filteredUsers = [];
				},
			});
	}

	loadRoles(): void {
		this.isLoadingRoles = true;
		this.roleErrorMessage = '';

		this.accessManagementService
			.getRoles()
			.pipe(
				takeUntil(this.destroy$),
				finalize(() => {
					this.isLoadingRoles = false;
				}),
			)
			.subscribe({
				next: (roles) => {
					this.roles = roles ?? [];
					this.applyRoleFilters();
				},
				error: (error) => {
					this.roleErrorMessage =
						error?.error?.meta?.message ?? 'Failed to load roles.';

					this.roles = [];
					this.filteredRoles = [];
				},
			});
	}

	resetUserFilters(): void {
		this.userSearch.setValue('', {
			emitEvent: false,
		});

		this.userStatus.setValue('all', {
			emitEvent: false,
		});

		this.applyUserFilters();
	}

	resetRoleFilters(): void {
		this.roleSearch.setValue('', {
			emitEvent: false,
		});

		this.applyRoleFilters();
	}

	openAssignRoleDialog(user: AccessUser): void {
		const dialogRef = this.dialog.open<
			AssignRoleDialogComponent,
			AssignRoleDialogData
		>(AssignRoleDialogComponent, {
			width: '680px',
			maxWidth: '95vw',
			disableClose: true,
			data: {
				user,
			},
		});

		dialogRef
			.afterClosed()
			.pipe(takeUntil(this.destroy$))
			.subscribe((result) => {
				if (result?.action !== 'save') {
					return;
				}

				this.loadData();
			});
	}

	openManagePermissionDialog(role: RoleSummary): void {
		const dialogRef = this.dialog.open<
			ManagePermissionDialogComponent,
			ManagePermissionDialogData
		>(ManagePermissionDialogComponent, {
			width: '1180px',
			maxWidth: '96vw',
			height: 'auto',
			maxHeight: '94vh',
			disableClose: true,
			autoFocus: false,
			restoreFocus: false,
			panelClass: 'manage-permission-dialog-panel',
			data: {
				role,
			},
		});

		dialogRef
			.afterClosed()
			.pipe(takeUntil(this.destroy$))
			.subscribe((result) => {
				if (result?.action !== 'save') {
					return;
				}

				this.loadData();
			});
	}

	getInitials(fullName: string): string {
		return String(fullName || '')
			.split(' ')
			.filter(Boolean)
			.slice(0, 2)
			.map((name) => name.charAt(0).toUpperCase())
			.join('');
	}

	trackByUserUuid(index: number, user: AccessUser): string {
		return user.uuid;
	}

	trackByRoleUuid(index: number, role: RoleSummary): string {
		return role.uuid;
	}

	private applyUserFilters(): void {
		const searchValue = this.userSearch.value.trim().toLowerCase();
		const selectedStatus = this.userStatus.value;

		this.filteredUsers = this.users
			.filter((user) => {
				const isActive = Boolean(user.isActive);

				if (selectedStatus === 'active' && !isActive) {
					return false;
				}

				if (selectedStatus === 'inactive' && isActive) {
					return false;
				}

				if (!searchValue) {
					return true;
				}

				const searchableValue = [
					user.fullName,
					user.email,
					user.phone,
					user.company?.code,
					user.company?.name,
					user.division?.code,
					user.division?.name,
					...(user.roles ?? []).reduce((result: string[], role) => {
						if (role.code) {
							result.push(role.code);
						}

						if (role.name) {
							result.push(role.name);
						}

						return result;
					}, []),
				]
					.filter(Boolean)
					.join(' ')
					.toLowerCase();

				return searchableValue.includes(searchValue);
			})
			.sort((a, b) => {
				return String(a.fullName || a.email).localeCompare(
					String(b.fullName || b.email),
				);
			});
	}

	private applyRoleFilters(): void {
		const searchValue = this.roleSearch.value.trim().toLowerCase();

		this.filteredRoles = this.roles
			.filter((role) => {
				if (!searchValue) {
					return true;
				}

				const searchableValue = [role.code, role.name, role.description]
					.filter(Boolean)
					.join(' ')
					.toLowerCase();

				return searchableValue.includes(searchValue);
			})
			.sort((a, b) => a.name.localeCompare(b.name));
	}
}
