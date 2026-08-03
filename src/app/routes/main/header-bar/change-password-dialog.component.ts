import { Component } from '@angular/core';
import {
	AbstractControl,
	FormBuilder,
	ValidationErrors,
	Validators,
} from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { finalize } from 'rxjs';

import { MainService } from '../main.service';

@Component({
	selector: 'app-change-password-dialog',
	templateUrl: './change-password-dialog.component.html',
	styleUrls: ['./change-password-dialog.component.scss'],
	standalone: false,
})
export class ChangePasswordDialogComponent {
	isSaving = false;
	errorMessage = '';

	showCurrentPassword = false;
	showNewPassword = false;
	showConfirmPassword = false;

	readonly form = this.formBuilder.nonNullable.group(
		{
			currentPassword: [
				'',
				[Validators.required, Validators.maxLength(100)],
			],
			newPassword: [
				'',
				[
					Validators.required,
					Validators.minLength(8),
					Validators.maxLength(100),
				],
			],
			confirmPassword: [
				'',
				[Validators.required, Validators.maxLength(100)],
			],
		},
		{
			validators: [ChangePasswordDialogComponent.passwordMatchValidator],
		},
	);

	constructor(
		private readonly formBuilder: FormBuilder,
		private readonly mainService: MainService,
		private readonly dialogRef: MatDialogRef<ChangePasswordDialogComponent>,
	) {}

	hasError(
		controlName: 'currentPassword' | 'newPassword' | 'confirmPassword',
		errorCode?: string,
	): boolean {
		const control = this.form.controls[controlName];

		if (!(control.dirty || control.touched)) {
			return false;
		}

		return errorCode ? control.hasError(errorCode) : control.invalid;
	}

	get passwordMismatch(): boolean {
		return (
			this.form.hasError('passwordMismatch') &&
			this.form.controls.confirmPassword.touched
		);
	}

	save(): void {
		if (this.form.invalid || this.isSaving) {
			this.form.markAllAsTouched();
			return;
		}

		const value = this.form.getRawValue();

		this.isSaving = true;
		this.errorMessage = '';

		this.mainService
			.changePassword({
				currentPassword: value.currentPassword,
				newPassword: value.newPassword,
				confirmPassword: value.confirmPassword,
			})
			.pipe(
				finalize(() => {
					this.isSaving = false;
				}),
			)
			.subscribe({
				next: () => {
					this.dialogRef.close({
						action: 'save',
					});
				},
				error: (error) => {
					this.errorMessage =
						error?.error?.meta?.message ??
						'Failed to change password.';
				},
			});
	}

	cancel(): void {
		if (!this.isSaving) {
			this.dialogRef.close();
		}
	}

	private static passwordMatchValidator(
		control: AbstractControl,
	): ValidationErrors | null {
		const newPassword = control.get('newPassword')?.value;

		const confirmPassword = control.get('confirmPassword')?.value;

		if (!newPassword || !confirmPassword) {
			return null;
		}

		return newPassword === confirmPassword
			? null
			: {
					passwordMismatch: true,
				};
	}
}
