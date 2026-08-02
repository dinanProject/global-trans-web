import { Component, Inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RequestAction, RequestMaster } from '../../request/request.service';

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
export class ReviewDialogComponent {
	errorMessage = '';

	readonly form = this.formBuilder.group({
		startDate: [
			this.toDateInputValue(this.data.request.startDate),
			Validators.required,
		],
		endDate: [
			this.toDateInputValue(this.data.request.endDate),
			Validators.required,
		],
		remarks: ['', Validators.maxLength(2000)],
	});

	constructor(
		private readonly formBuilder: FormBuilder,
		private readonly dialogRef: MatDialogRef<ReviewDialogComponent>,
		@Inject(MAT_DIALOG_DATA)
		public readonly data: ReviewDialogData,
	) {
		console.log('[review dialog dates]', {
			rawStartDate: this.data.request.startDate,
			rawEndDate: this.data.request.endDate,
			inputStartDate: this.form.controls.startDate.value,
			inputEndDate: this.form.controls.endDate.value,
		});
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

	submit(action: RequestAction): void {
		if (this.form.invalid) {
			this.form.markAllAsTouched();
			return;
		}

		this.errorMessage = '';

		const value = this.form.getRawValue();

		const startDate = value.startDate || '';
		const endDate = value.endDate || '';

		if (startDate > endDate) {
			this.errorMessage =
				'End date tidak boleh lebih kecil dari start date.';
			return;
		}

		if (action.requiresRemarks && !value.remarks?.trim()) {
			this.errorMessage = 'Remarks wajib diisi untuk action ini.';
			this.form.controls.remarks.markAsTouched();
			return;
		}

		this.dialogRef.close(<ReviewDialogResult>{
			actionCode: action.actionCode,
			action,
			startDate: this.formatDatabaseDate(value.startDate),
			endDate: this.formatDatabaseDate(value.endDate),
			remarks: value.remarks?.trim() || null,
		});
	}

	cancel(): void {
		this.dialogRef.close();
	}

	private toDateInputValue(value: string | Date | null | undefined): string {
		if (!value) return '';

		// Kalau backend sudah kirim date-only aman: "2026-08-01"
		if (typeof value === 'string') {
			const text = value.trim();

			if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
				return text;
			}

			// Kalau ISO datetime: "2026-07-31T17:00:00.000Z"
			// parse ke local timezone dulu.
			const date = new Date(text);

			if (Number.isNaN(date.getTime())) {
				return '';
			}

			return this.formatLocalDate(date);
		}

		if (Number.isNaN(value.getTime())) {
			return '';
		}

		return this.formatLocalDate(value);
	}

	private formatLocalDate(date: Date): string {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');

		return `${year}-${month}-${day}`;
	}

	private formatDatabaseDate(
		value: string | Date | null | undefined,
	): string | null {
		if (!value) return null;

		if (typeof value === 'string') {
			const text = value.trim();

			if (!text) return null;

			if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
				return text;
			}

			const date = new Date(text);

			if (Number.isNaN(date.getTime())) {
				return null;
			}

			return this.formatLocalDate(date);
		}

		if (Number.isNaN(value.getTime())) {
			return null;
		}

		return this.formatLocalDate(value);
	}
}
