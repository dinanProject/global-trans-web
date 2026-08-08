import { Component, Inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import {
	EmailOutbox,
	EmailOutboxDetail,
	EmailRetryPayload,
} from '../email.service';

export interface EmailRetryDialogData {
	email: EmailOutboxDetail;
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
		private readonly sanitizer: DomSanitizer,
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

	get previewHtml(): SafeHtml | null {
		const html = this.data.email.bodyHtml || '';

		if (!html) {
			return null;
		}

		const previewStyle = `
		<style>
			* {
				box-sizing: border-box;
			}

			html,
			body {
				width: 100%;
				max-width: 100%;
				margin: 0;
				padding: 0;
				background: #ffffff;
			}

			body {
				padding: 24px;
				color: #354052;
				font-family: Arial, Helvetica, sans-serif;
				font-size: 14px;
				line-height: 1.55;
				overflow-wrap: break-word;
			}

			img {
				display: block;
				max-width: 100% !important;
				height: auto !important;
			}

			table {
				width: 100% !important;
				max-width: 100% !important;
				border-collapse: collapse;
			}

			td,
			th {
				max-width: 100%;
				overflow-wrap: break-word;
			}

			pre {
				max-width: 100%;
				white-space: pre-wrap;
				overflow-wrap: break-word;
			}

			a {
				overflow-wrap: anywhere;
			}
		</style>
	`;

		let previewDocument: string;

		if (/<head[^>]*>/i.test(html)) {
			previewDocument = html.replace(
				/<head([^>]*)>/i,
				`<head$1>${previewStyle}`,
			);
		} else if (/<html[^>]*>/i.test(html)) {
			previewDocument = html.replace(
				/<html([^>]*)>/i,
				`<html$1><head>${previewStyle}</head>`,
			);
		} else {
			previewDocument = `
			<!doctype html>
			<html>
				<head>
					${previewStyle}
				</head>
				<body>
					${html}
				</body>
			</html>
		`;
		}

		return this.sanitizer.bypassSecurityTrustHtml(previewDocument);
	}

	get previewText(): string {
		return this.data.email.bodyText || '';
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
