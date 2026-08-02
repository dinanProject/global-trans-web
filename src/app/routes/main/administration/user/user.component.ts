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
import { UtilityService } from 'src/app/shared/utility/utility.service';
import {
	UserFormDialogComponent,
	UserFormDialogData,
} from './user-form-dialog/user-form-dialog.component';
import { UserMaster, UserOptions, UserService } from './user.service';
import { SessionService } from 'src/app/core/services/session.service';

@Component({
	selector: 'app-user',
	templateUrl: './user.component.html',
	styleUrls: ['./user.component.scss'],
	standalone: false,
})
export class UserComponent implements OnInit, OnDestroy {
	private readonly destroy$ = new Subject<void>();
	readonly searchControl = new FormControl('', { nonNullable: true });
	readonly statusControl = new FormControl<'all' | 'active' | 'inactive'>(
		'all',
		{ nonNullable: true },
	);
	users: UserMaster[] = [];
	filteredUsers: UserMaster[] = [];
	options: UserOptions = { companies: [], divisions: [], roles: [] };
	isLoading = false;
	deletingUuid = '';
	errorMessage = '';

	constructor(
		private readonly userService: UserService,
		private readonly sessionService: SessionService,
		private readonly dialog: MatDialog,
		private readonly utilityService: UtilityService,
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
		this.loadOptions();
		this.loadUsers();
	}
	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	loadUsers(): void {
		this.isLoading = true;
		this.errorMessage = '';
		this.userService
			.getUsers()
			.pipe(
				takeUntil(this.destroy$),
				finalize(() => (this.isLoading = false)),
			)
			.subscribe({
				next: (users) => {
					this.users = users ?? [];
					this.applyFilters();
				},
				error: (error) => {
					this.users = [];
					this.filteredUsers = [];
					this.errorMessage =
						error?.error?.meta?.message ?? 'Failed to load users.';
				},
			});
	}
	loadOptions(): void {
		this.userService
			.getOptions()
			.pipe(takeUntil(this.destroy$))
			.subscribe({ next: (value) => (this.options = value) });
	}
	resetFilters(): void {
		this.searchControl.setValue('', { emitEvent: false });
		this.statusControl.setValue('all', { emitEvent: false });
		this.applyFilters();
	}
	openCreateDialog(): void {
		this.openDialog({ mode: 'create', options: this.options });
	}
	openEditDialog(user: UserMaster): void {
		this.userService
			.getUser(user.uuid)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (detail) => {
					this.openDialog({
						mode: 'edit',
						user: detail,
						options: this.options,
					});
				},
				error: (error) => {
					this.utilityService.alert(
						'Failed',
						error?.error?.meta?.message ?? 'Failed to load user.',
						'error',
					);
				},
			});
	}

	isProtectedSystemDeveloperAccount(user: UserMaster): boolean {
		const targetIsSystemDeveloper = String(user.roleNames ?? '')
			.toUpperCase()
			.includes('SYSTEM_DEVELOPER');

		const currentUserIsSystemDeveloper =
			this.sessionService.isSystemDeveloper();

		return targetIsSystemDeveloper && !currentUserIsSystemDeveloper;
	}

	async deleteUser(user: UserMaster): Promise<void> {
		const confirmed = await this.utilityService.confirm(
			'Deactivate User',
			`Deactivate user "${user.fullName}"?`,
			'warning',
		);
		if (!confirmed) return;
		this.deletingUuid = user.uuid;
		this.userService
			.deactivateUser(user.uuid)
			.pipe(finalize(() => (this.deletingUuid = '')))
			.subscribe({
				next: () => {
					this.utilityService.alert(
						'Success',
						`User "${user.fullName}" berhasil dinonaktifkan.`,
						'success',
					);
					this.loadUsers();
				},
				error: (error) =>
					this.utilityService.alert(
						'Failed',
						error?.error?.meta?.message ??
							'Failed to deactivate user.',
						'error',
					),
			});
	}
	trackByUuid(_: number, user: UserMaster): string {
		return user.uuid;
	}

	private openDialog(data: UserFormDialogData): void {
		this.dialog
			.open(UserFormDialogComponent, {
				width: '1120px',
				maxWidth: '96vw',
				maxHeight: '94vh',
				disableClose: true,
				autoFocus: false,
				panelClass: 'user-form-dialog-panel',
				data,
			})
			.afterClosed()
			.pipe(takeUntil(this.destroy$))
			.subscribe((result) => {
				if (result?.action === 'save') {
					this.utilityService.alert(
						'Success',
						data.mode === 'create'
							? 'User berhasil dibuat.'
							: 'User berhasil diperbarui.',
						'success',
					);
					this.loadUsers();
				}
			});
	}
	private applyFilters(): void {
		const keyword = this.searchControl.value.trim().toLowerCase();
		const status = this.statusControl.value;
		this.filteredUsers = this.users
			.filter((user) => {
				const active = Boolean(user.isActive);
				if (status === 'active' && !active) return false;
				if (status === 'inactive' && active) return false;
				if (!keyword) return true;
				return [
					user.fullName,
					user.email,
					user.phone,
					user.companyName,
					user.companyCode,
					user.divisionName,
					user.roleNames,
				]
					.filter(Boolean)
					.join(' ')
					.toLowerCase()
					.includes(keyword);
			})
			.sort((a, b) => a.fullName.localeCompare(b.fullName));
	}
}
