import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import {
	Subject,
	debounceTime,
	distinctUntilChanged,
	finalize,
	takeUntil,
} from 'rxjs';

import {
	Lookup,
	LookupService,
} from 'src/app/shared/sys-lookup/lookup.service';

import { LoginLog, LoginLogService } from './login-log.service';

@Component({
	selector: 'app-login-log',
	templateUrl: './login-log.component.html',
	styleUrls: ['./login-log.component.scss'],
	standalone: false,
})
export class LoginLogComponent implements OnInit, OnDestroy {
	private readonly destroy$ = new Subject<void>();

	readonly searchControl = new FormControl('', {
		nonNullable: true,
	});

	readonly statusControl = new FormControl('', {
		nonNullable: true,
	});

	readonly dateFromControl = new FormControl('', {
		nonNullable: true,
	});

	readonly dateToControl = new FormControl('', {
		nonNullable: true,
	});

	readonly displayedColumns = [
		'createdAt',
		'user',
		'status',
		'failure',
		'ipAddress',
		'userAgent',
	];

	readonly pageSizeOptions = [10, 20, 50, 100];

	loginLogs: LoginLog[] = [];
	loginStatuses: Lookup[] = [];

	isLoading = false;
	isStatusLoading = false;
	errorMessage = '';

	page = 1;
	limit = 20;
	total = 0;

	constructor(
		private readonly loginLogService: LoginLogService,
		private readonly lookupService: LookupService,
	) {}

	ngOnInit(): void {
		this.loadLoginStatuses();
		this.initFilterListeners();
		this.loadLoginLogs();
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	private initFilterListeners(): void {
		this.searchControl.valueChanges
			.pipe(
				debounceTime(350),
				distinctUntilChanged(),
				takeUntil(this.destroy$),
			)
			.subscribe(() => {
				this.page = 1;
				this.loadLoginLogs();
			});

		this.statusControl.valueChanges
			.pipe(distinctUntilChanged(), takeUntil(this.destroy$))
			.subscribe(() => {
				this.page = 1;
				this.loadLoginLogs();
			});

		this.dateFromControl.valueChanges
			.pipe(distinctUntilChanged(), takeUntil(this.destroy$))
			.subscribe(() => {
				this.page = 1;
				this.loadLoginLogs();
			});

		this.dateToControl.valueChanges
			.pipe(distinctUntilChanged(), takeUntil(this.destroy$))
			.subscribe(() => {
				this.page = 1;
				this.loadLoginLogs();
			});
	}

	private loadLoginStatuses(): void {
		this.isStatusLoading = true;

		this.lookupService
			.getLookupsByGroup('LOGIN_STATUS')
			.pipe(
				takeUntil(this.destroy$),
				finalize(() => {
					this.isStatusLoading = false;
				}),
			)
			.subscribe({
				next: (response) => {
					this.loginStatuses = response ?? [];
				},
				error: () => {
					this.loginStatuses = [];
				},
			});
	}

	loadLoginLogs(): void {
		this.isLoading = true;
		this.errorMessage = '';

		this.loginLogService
			.getLoginLogs({
				page: this.page,
				limit: this.limit,
				search: this.searchControl.value,
				status: this.statusControl.value,
				dateFrom: this.dateFromControl.value,
				dateTo: this.dateToControl.value,
			})
			.pipe(
				takeUntil(this.destroy$),
				finalize(() => {
					this.isLoading = false;
				}),
			)
			.subscribe({
				next: (response) => {
					this.loginLogs = response?.data ?? [];

					this.page = response?.pagination?.page ?? this.page;

					this.limit = response?.pagination?.limit ?? this.limit;

					this.total = response?.pagination?.total ?? 0;
				},
				error: (error) => {
					this.loginLogs = [];
					this.total = 0;

					this.errorMessage =
						error?.error?.meta?.message ??
						error?.error?.message ??
						'Failed to load login activity logs.';
				},
			});
	}

	getStatusLabel(statusCode: string | null): string {
		const normalizedCode = statusCode?.trim().toUpperCase();

		if (normalizedCode === 'SUCCESS') {
			return 'Successful';
		}

		if (normalizedCode === 'FAILED') {
			return 'Failed';
		}

		return statusCode || 'Unknown';
	}

	getLookupStatusLabel(status: Lookup): string {
		return this.getStatusLabel(status.lookupCode);
	}

	resetFilters(): void {
		this.searchControl.setValue('', {
			emitEvent: false,
		});

		this.statusControl.setValue('', {
			emitEvent: false,
		});

		this.dateFromControl.setValue('', {
			emitEvent: false,
		});

		this.dateToControl.setValue('', {
			emitEvent: false,
		});

		this.page = 1;
		this.loadLoginLogs();
	}

	onPageChange(event: PageEvent): void {
		this.page = event.pageIndex + 1;
		this.limit = event.pageSize;

		this.loadLoginLogs();
	}

	getUserName(log: LoginLog): string {
		return log.fullName?.trim() || 'Unknown User';
	}

	getUserInitial(log: LoginLog): string {
		return this.getUserName(log).charAt(0).toUpperCase();
	}

	getFailureLabel(reason: string | null): string {
		if (!reason) {
			return '—';
		}

		const labels: Record<string, string> = {
			MISSING_CREDENTIALS: 'Missing credentials',
			INVALID_CREDENTIALS: 'Invalid credentials',
			INVALID_PASSWORD: 'Invalid password',
			USER_NOT_FOUND: 'User not found',
			USER_INACTIVE: 'User inactive',
			ACCESS_LOAD_FAILED: 'Access load failed',
			SESSION_CREATION_FAILED: 'Session creation failed',
			INTERNAL_ERROR: 'Internal error',
		};

		return labels[reason] ?? reason;
	}

	formatUserAgent(userAgent: string | null): string {
		if (!userAgent) {
			return '—';
		}

		if (userAgent.length <= 90) {
			return userAgent;
		}

		return `${userAgent.slice(0, 87)}...`;
	}

	getStatusClass(statusCode: string | null): string {
		const normalizedCode = statusCode?.trim().toUpperCase();

		if (normalizedCode === 'SUCCESS') {
			return 'status-success';
		}

		if (normalizedCode === 'FAILED') {
			return 'status-failed';
		}

		return 'status-default';
	}

	trackByUuid(_: number, log: LoginLog): string {
		return log.uuid;
	}
}
