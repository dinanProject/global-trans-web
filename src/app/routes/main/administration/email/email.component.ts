import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import {
	Subject,
	debounceTime,
	distinctUntilChanged,
	finalize,
	takeUntil,
} from 'rxjs';

import { SessionService } from 'src/app/core/services/session.service';
import { UtilityService } from 'src/app/shared/utility/utility.service';

import {
	EmailRetryDialogComponent,
	EmailRetryDialogData,
} from './email-retry-dialog/email-retry-dialog.component';
import { EmailOutbox, EmailRetryPayload, EmailService } from './email.service';

@Component({
	selector: 'app-email',
	templateUrl: './email.component.html',
	styleUrls: ['./email.component.scss'],
	standalone: false,
})
export class EmailComponent implements OnInit, OnDestroy {
	private readonly destroy$ = new Subject<void>();

	readonly searchControl = new FormControl('', { nonNullable: true });
	readonly statusControl = new FormControl('', { nonNullable: true });
	readonly dateFromControl = new FormControl('', { nonNullable: true });
	readonly dateToControl = new FormControl('', { nonNullable: true });

	readonly displayedColumns = [
		'createdAt',
		'recipient',
		'subject',
		'status',
		'attempt',
		'actions',
	];
	readonly pageSizeOptions = [10, 20, 50, 100];
	readonly statuses = ['QUEUED', 'PROCESSING', 'SENT', 'FAILED', 'CANCELLED'];

	emails: EmailOutbox[] = [];
	isLoading = false;
	actionUuid = '';
	errorMessage = '';

	page = 1;
	limit = 20;
	total = 0;

	constructor(
		private readonly emailService: EmailService,
		private readonly sessionService: SessionService,
		private readonly dialog: MatDialog,
		private readonly utilityService: UtilityService,
	) {}

	ngOnInit(): void {
		this.initFilterListeners();
		this.loadEmails();
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
				this.loadEmails();
			});

		[this.statusControl, this.dateFromControl, this.dateToControl].forEach(
			(control) => {
				control.valueChanges
					.pipe(distinctUntilChanged(), takeUntil(this.destroy$))
					.subscribe(() => {
						this.page = 1;
						this.loadEmails();
					});
			},
		);
	}

	loadEmails(): void {
		this.isLoading = true;
		this.errorMessage = '';

		this.emailService
			.getEmails({
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
					this.emails = response?.data ?? [];
					this.page = response?.pagination?.page ?? this.page;
					this.limit = response?.pagination?.limit ?? this.limit;
					this.total = response?.pagination?.total ?? 0;
				},
				error: (error) => {
					this.emails = [];
					this.total = 0;
					this.errorMessage =
						error?.error?.meta?.message ??
						'Failed to load email outboxes.';
				},
			});
	}

	resetFilters(): void {
		this.searchControl.setValue('', { emitEvent: false });
		this.statusControl.setValue('', { emitEvent: false });
		this.dateFromControl.setValue('', { emitEvent: false });
		this.dateToControl.setValue('', { emitEvent: false });
		this.page = 1;
		this.loadEmails();
	}

	onPageChange(event: PageEvent): void {
		this.page = event.pageIndex + 1;
		this.limit = event.pageSize;
		this.loadEmails();
	}

	canRetry(email: EmailOutbox): boolean {
		return (
			this.sessionService.hasPermission('EMAIL_OUTBOX.RETRY') &&
			['QUEUED', 'SENT', 'FAILED', 'CANCELLED'].includes(email.statusCode)
		);
	}

	openRetryDialog(email: EmailOutbox): void {
		this.emailService
			.getEmail(email.uuid)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (detail) => {
					const data: EmailRetryDialogData = {
						email: detail,
					};

					this.dialog
						.open(EmailRetryDialogComponent, {
							width: '1180px',
							maxWidth: '96vw',
							disableClose: true,
							autoFocus: false,
							data,
						})
						.afterClosed()
						.pipe(takeUntil(this.destroy$))
						.subscribe((result) => {
							if (result?.action !== 'retry') {
								return;
							}

							void this.retryEmail(email, result.payload);
						});
				},
				error: () => {
					void this.utilityService.alert(
						'Retry Email',
						'Gagal memuat detail email.',
						'error',
					);
				},
			});
	}

	async retryEmail(
		email: EmailOutbox,
		payload: EmailRetryPayload,
	): Promise<void> {
		const confirmed = await this.utilityService.confirm(
			'Retry Email',
			`Kirim ulang email "${email.subject}" ke ${payload.toEmail}?`,
			'warning',
		);

		if (!confirmed) {
			return;
		}

		this.actionUuid = email.uuid;

		this.emailService
			.retryEmail(email.uuid, payload)
			.pipe(
				takeUntil(this.destroy$),
				finalize(() => {
					this.actionUuid = '';
				}),
			)
			.subscribe({
				next: (result) => {
					const target = this.emails.find(
						(item) => item.uuid === result.uuid,
					);

					if (target) {
						target.toEmail = payload.toEmail;
						target.ccEmail = payload.ccEmail;
						target.bccEmail = payload.bccEmail;
						target.statusCode = result.statusCode;
						target.attemptCount = 0;
						target.lastAttemptAt = null;
						target.sentAt = null;
						target.failedAt = null;
						target.lastErrorMessage = null;
						target.providerMessageId = null;
						target.isActive = true;

						this.emails = [...this.emails];
					}

					this.utilityService.alert(
						'Success',
						'Email berhasil dimasukkan kembali ke antrean.',
						'success',
					);
				},
				error: (error) => {
					this.utilityService.alert(
						'Failed',
						error?.error?.meta?.message ?? 'Failed to retry email.',
						'error',
					);
				},
			});
	}

	getStatusClass(statusCode: string): string {
		return `status-${statusCode.toLowerCase()}`;
	}

	trackByUuid(_: number, email: EmailOutbox): string {
		return email.uuid;
	}
}
