import { Component, Inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { EmailOutbox, EmailRetryPayload } from '../email.service';

export interface EmailRetryDialogData {
	email: EmailOutbox;
}

@Component({
	selector: 'app-email-retry-dialog',
	templateUrl: './email-retry-dialog.component.html',
	styleUrls: ['./email-retry-dialog.component.scss'],
	standalone: false,
})
export class EmailRetryDialogComponent {
	readonly form = this.formBuilder.group({
		toEmail: [this.data.email.toEmail, [Validators.required]],
		ccEmail: [this.data.email.ccEmail ?? ''],
		bccEmail: [this.data.email.bccEmail ?? ''],
	});

	constructor(
		private readonly formBuilder: FormBuilder,
		private readonly dialogRef: MatDialogRef<EmailRetryDialogComponent>,
		@Inject(MAT_DIALOG_DATA) readonly data: EmailRetryDialogData,
	) {}

	get lastActivity(): string | null {
		const email = this.data.email;

		return (
			email.sentAt ??
			email.failedAt ??
			email.lastAttemptAt ??
			email.queuedAt ??
			null
		);
	}

	cancel(): void {
		this.dialogRef.close();
	}

	save(): void {
		if (this.form.invalid) {
			this.form.markAllAsTouched();
			return;
		}

		const value = this.form.getRawValue();
		const payload: EmailRetryPayload = {
			toEmail: value.toEmail?.trim() ?? '',
			ccEmail: value.ccEmail?.trim() || null,
			bccEmail: value.bccEmail?.trim() || null,
		};

		this.dialogRef.close({
			action: 'retry',
			payload,
		});
	}
}
