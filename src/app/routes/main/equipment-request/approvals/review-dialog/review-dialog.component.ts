import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { finalize, Subject, takeUntil } from 'rxjs';

import { RequestAction, RequestMaster } from '../../request/request.service';
import { ApprovalService } from '../approvals.service';

export interface ReviewDialogData {
	request: RequestMaster;
	action: RequestAction;
	actions: RequestAction[];
	approveActions: RequestAction[];
	rejectActions: RequestAction[];
}

export interface ReviewDialogResult {
	actionCode: string;
	startDate: string;
	endDate: string;
	remarks: string | null;
}

@Component({
	selector: 'app-review-dialog',
	templateUrl: './review-dialog.component.html',
	styleUrls: ['./review-dialog.component.scss'],
	standalone: false,
})
export class ReviewDialogComponent implements OnInit, OnDestroy {
	private readonly destroy$ = new Subject<void>();

	errorMessage = '';
	isCheckingAvailability = false;

	readonly form = this.formBuilder.group({
		startDate: [
			this.toDateTimeInputValue(this.data.request.startDate),
			Validators.required,
		],
		endDate: [
			this.toDateTimeInputValue(this.data.request.endDate),
			Validators.required,
		],
		remarks: ['', Validators.maxLength(2000)],
	});

	constructor(
		private readonly formBuilder: FormBuilder,
		private readonly dialogRef: MatDialogRef<ReviewDialogComponent>,
		private readonly approvalService: ApprovalService,
		@Inject(MAT_DIALOG_DATA)
		public readonly data: ReviewDialogData,
	) {}

	ngOnInit(): void {
		this.form.controls.startDate.valueChanges
			.pipe(takeUntil(this.destroy$))
			.subscribe(() => {
				this.validateSchedule();
			});

		this.form.controls.endDate.valueChanges
			.pipe(takeUntil(this.destroy$))
			.subscribe(() => {
				this.validateSchedule();
			});
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	getDialogTitle(): string {
		if (this.isClientReview()) {
			return 'Client Review';
		}

		return 'Global Trans Review';
	}

	getInfoTitle(): string {
		if (this.isClientReview()) {
			return 'Review client approval';
		}

		return 'Review reservation schedule';
	}

	getInfoDescription(): string {
		if (this.isClientReview()) {
			return 'Client approver dapat memeriksa dan menyesuaikan jadwal reservasi, equipment, serta catatan sebelum request disetujui.';
		}

		return 'Global Trans dapat menyesuaikan jadwal sebelum request disetujui dan diteruskan ke assignment.';
	}

	getRemarksPlaceholder(): string {
		if (this.isClientReview()) {
			return 'Contoh: Jadwal sudah sesuai dengan kebutuhan operasional.';
		}

		return 'Contoh: Reschedule jadwal karena unit baru tersedia pada tanggal tersebut.';
	}

	isClientReview(): boolean {
		return (this.data.actions ?? []).some((action) =>
			['APPROVE_CLIENT', 'REJECT_CLIENT'].includes(action.actionCode),
		);
	}

	private isApproveAction(action: RequestAction): boolean {
		return ['APPROVE_CLIENT', 'APPROVE_GTSI'].includes(action.actionCode);
	}

	getAvailabilityLabel(
		status?: string | null,
		statusName?: string | null,
	): string {
		return statusName || status || 'Availability unknown';
	}

	formatDisplayDateTime(value?: string | null): string {
		if (!value) {
			return '—';
		}

		const date = new Date(value);

		if (Number.isNaN(date.getTime())) {
			return value;
		}

		const day = String(date.getDate()).padStart(2, '0');
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const year = date.getFullYear();
		const hour = String(date.getHours()).padStart(2, '0');
		const minute = String(date.getMinutes()).padStart(2, '0');

		return `${day}/${month}/${year} ${hour}:${minute}`;
	}

	formatInputDisplay(value?: string | null): string {
		const date = this.parseDateTimeLocal(value);

		if (!date) {
			return '';
		}

		const day = String(date.getDate()).padStart(2, '0');
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const year = date.getFullYear();
		const hour = String(date.getHours()).padStart(2, '0');
		const minute = String(date.getMinutes()).padStart(2, '0');

		return `${day}/${month}/${year} ${hour}:${minute}`;
	}

	openDatePicker(input: HTMLInputElement): void {
		if (typeof input.showPicker === 'function') {
			input.showPicker();
			return;
		}

		input.click();
	}

	submit(action: RequestAction): void {
		if (this.form.invalid) {
			this.form.markAllAsTouched();
			return;
		}

		this.errorMessage = '';

		if (!this.validateSchedule()) {
			return;
		}

		const value = this.form.getRawValue();
		const startDate = value.startDate || '';
		const endDate = value.endDate || '';

		if (action.requiresRemarks && !value.remarks?.trim()) {
			this.errorMessage = 'Remarks wajib diisi untuk action ini.';

			this.form.controls.remarks.markAsTouched();
			return;
		}

		const formattedStartDate = this.formatDatabaseDateTime(startDate);

		const formattedEndDate = this.formatDatabaseDateTime(endDate);

		if (!formattedStartDate || !formattedEndDate) {
			this.errorMessage = 'Format tanggal dan waktu tidak valid.';
			return;
		}

		const result: ReviewDialogResult = {
			actionCode: action.actionCode,
			startDate: formattedStartDate,
			endDate: formattedEndDate,
			remarks: value.remarks?.trim() || null,
		};

		if (!this.isApproveAction(action)) {
			this.dialogRef.close(result);
			return;
		}

		this.recheckAvailability(result);
	}

	private recheckAvailability(result: ReviewDialogResult): void {
		if (this.isCheckingAvailability) {
			return;
		}

		this.isCheckingAvailability = true;
		this.errorMessage = '';

		this.approvalService
			.getApprovalReview(this.data.request.uuid, {
				startDate: result.startDate,
				endDate: result.endDate,
			})
			.pipe(
				takeUntil(this.destroy$),
				finalize(() => {
					this.isCheckingAvailability = false;
				}),
			)
			.subscribe({
				next: (review) => {
					this.data.request.details = review.details ?? [];

					const unavailableDetails = (
						this.data.request.details ?? []
					).filter(
						(detail) =>
							!detail.availability?.isAvailableForRequestedPeriod,
					);

					if (unavailableDetails.length > 0) {
						this.errorMessage =
							`${unavailableDetails.length} equipment unit ` +
							'tidak tersedia pada periode yang dipilih. ' +
							'Periksa kembali availability equipment di atas.';

						return;
					}

					this.dialogRef.close(result);
				},
				error: (error) => {
					this.errorMessage =
						error?.error?.meta?.message ??
						error?.error?.message ??
						'Gagal memeriksa availability equipment.';
				},
			});
	}

	cancel(): void {
		this.dialogRef.close();
	}

	private validateSchedule(): boolean {
		const startDate = this.parseDateTimeLocal(
			this.form.controls.startDate.value,
		);

		const endDate = this.parseDateTimeLocal(
			this.form.controls.endDate.value,
		);

		if (!startDate || !endDate) {
			this.errorMessage = 'Format tanggal dan waktu tidak valid.';
			return false;
		}

		if (endDate < startDate) {
			this.errorMessage =
				'End date tidak boleh lebih kecil dari start date.';
			return false;
		}

		this.errorMessage = '';
		return true;
	}

	private toDateTimeInputValue(
		value: string | Date | null | undefined,
	): string {
		if (!value) {
			return '';
		}

		if (typeof value === 'string') {
			const text = value.trim();

			const localDateTimeMatch = text.match(
				/^(\d{4}-\d{2}-\d{2})[T\s](\d{2}):(\d{2})/,
			);

			if (
				localDateTimeMatch &&
				!/[zZ]$/.test(text) &&
				!/[+-]\d{2}:\d{2}$/.test(text)
			) {
				return (
					`${localDateTimeMatch[1]}T` +
					`${localDateTimeMatch[2]}:` +
					`${localDateTimeMatch[3]}`
				);
			}

			const date = new Date(text);

			if (Number.isNaN(date.getTime())) {
				return '';
			}

			return this.formatLocalDateTime(date);
		}

		if (Number.isNaN(value.getTime())) {
			return '';
		}

		return this.formatLocalDateTime(value);
	}

	private formatLocalDateTime(date: Date): string {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		const hour = String(date.getHours()).padStart(2, '0');
		const minute = String(date.getMinutes()).padStart(2, '0');

		return `${year}-${month}-${day}T${hour}:${minute}`;
	}

	private formatDatabaseDateTime(
		value: string | Date | null | undefined,
	): string | null {
		if (!value) {
			return null;
		}

		if (value instanceof Date) {
			if (Number.isNaN(value.getTime())) {
				return null;
			}

			return `${this.formatLocalDateTime(value).replace('T', ' ')}:00`;
		}

		const text = value.trim();

		if (!text) {
			return null;
		}

		const match = text.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);

		if (!match) {
			return null;
		}

		const [, year, month, day, hour, minute] = match;

		const date = new Date(
			Number(year),
			Number(month) - 1,
			Number(day),
			Number(hour),
			Number(minute),
			0,
			0,
		);

		if (
			date.getFullYear() !== Number(year) ||
			date.getMonth() + 1 !== Number(month) ||
			date.getDate() !== Number(day) ||
			date.getHours() !== Number(hour) ||
			date.getMinutes() !== Number(minute)
		) {
			return null;
		}

		return `${year}-${month}-${day} ${hour}:${minute}:00`;
	}

	private parseDateTimeLocal(value?: string | null): Date | null {
		if (!value) {
			return null;
		}

		const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);

		if (!match) {
			return null;
		}

		const [, year, month, day, hour, minute] = match;

		const date = new Date(
			Number(year),
			Number(month) - 1,
			Number(day),
			Number(hour),
			Number(minute),
			0,
			0,
		);

		if (
			date.getFullYear() !== Number(year) ||
			date.getMonth() + 1 !== Number(month) ||
			date.getDate() !== Number(day) ||
			date.getHours() !== Number(hour) ||
			date.getMinutes() !== Number(minute)
		) {
			return null;
		}

		return date;
	}
}
