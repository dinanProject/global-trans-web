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
		this.statusControl.disable({
			emitEvent: false,
		});

		this.lookupService
			.getLookupsByGroup('LOGIN_STATUS')
			.pipe(
				takeUntil(this.destroy$),
				finalize(() => {
					this.isStatusLoading = false;

					this.statusControl.enable({
						emitEvent: false,
					});
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

	getOperatingSystem(userAgent: string): string {
		if (/Windows NT 10\.0/i.test(userAgent)) {
			return 'Windows 10/11';
		}

		if (/Windows NT 6\.3/i.test(userAgent)) {
			return 'Windows 8.1';
		}

		if (/Windows NT 6\.2/i.test(userAgent)) {
			return 'Windows 8';
		}

		if (/Windows NT 6\.1/i.test(userAgent)) {
			return 'Windows 7';
		}

		if (/Android/i.test(userAgent)) {
			const match = userAgent.match(/Android\s([\d.]+)/i);

			return match ? `Android ${match[1]}` : 'Android';
		}

		if (/iPhone|iPad|iPod/i.test(userAgent)) {
			const match = userAgent.match(/OS\s([\d_]+)/i);

			return match ? `iOS ${match[1].replace(/_/g, '.')}` : 'iOS';
		}

		if (/Mac OS X/i.test(userAgent)) {
			const match = userAgent.match(/Mac OS X\s([\d_]+)/i);

			return match ? `macOS ${match[1].replace(/_/g, '.')}` : 'macOS';
		}

		if (/Linux/i.test(userAgent)) {
			return 'Linux';
		}

		return 'Unknown OS';
	}

	getDeviceName(userAgent: string): string {
		if (/iPhone/i.test(userAgent)) {
			return 'iPhone';
		}

		if (/iPad/i.test(userAgent)) {
			return 'iPad';
		}

		if (/iPod/i.test(userAgent)) {
			return 'iPod';
		}

		if (/Android/i.test(userAgent)) {
			const match = userAgent.match(
				/Android[^;]*;\s*([^;)]+?)(?:\s+Build\/|\))/i,
			);

			if (match?.[1]) {
				return match[1].trim();
			}

			return 'Android Device';
		}

		if (/Windows/i.test(userAgent)) {
			return 'Windows PC';
		}

		if (/Macintosh|Mac OS X/i.test(userAgent)) {
			return 'Mac';
		}

		if (/Linux/i.test(userAgent)) {
			return 'Linux PC';
		}

		return 'Unknown Device';
	}

	formatUserAgent(userAgent: string | null): string {
		if (!userAgent) {
			return '—';
		}

		let browser = 'Unknown Browser';

		if (/Edg\//i.test(userAgent)) {
			browser = 'Microsoft Edge';
		} else if (/OPR\//i.test(userAgent)) {
			browser = 'Opera';
		} else if (/Chrome\//i.test(userAgent)) {
			browser = 'Google Chrome';
		} else if (/Firefox\//i.test(userAgent)) {
			browser = 'Mozilla Firefox';
		} else if (/Safari\//i.test(userAgent)) {
			browser = 'Safari';
		}

		const os = this.getOperatingSystem(userAgent);
		const device = this.getDeviceName(userAgent);

		return `${browser} • ${os} • ${device}`;
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
