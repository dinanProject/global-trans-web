import { Component, Inject } from '@angular/core';
import {
	AbstractControl,
	FormBuilder,
	ValidationErrors,
	Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { finalize } from 'rxjs';

import { UserService } from '../user.service';

export interface UserPasswordDialogData {
	uuid: string;
	fullName: string;
	email: string;
}

@Component({
	selector: 'app-user-password-dialog',
	templateUrl: './user-password-dialog.component.html',
	styleUrls: ['./user-password-dialog.component.scss'],
	standalone: false,
})
export class UserPasswordDialogComponent {
	isSaving = false;
	errorMessage = '';
	showPassword = false;
	showConfirmPassword = false;

	readonly form = this.formBuilder.nonNullable.group(
		{
			password: [
				'',
				[
					Validators.required,
					Validators.minLength(8),
					Validators.maxLength(100),
				],
			],
			confirmPassword: ['', Validators.required],
		},
		{
			validators: [UserPasswordDialogComponent.passwordMatchValidator],
		},
	);

	constructor(
		private readonly formBuilder: FormBuilder,
		private readonly userService: UserService,
		private readonly dialogRef: MatDialogRef<UserPasswordDialogComponent>,
		@Inject(MAT_DIALOG_DATA)
		public readonly data: UserPasswordDialogData,
	) {}

	hasError(
		controlName: 'password' | 'confirmPassword',
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

		this.isSaving = true;
		this.errorMessage = '';

		const password = this.form.controls.password.value;

		this.userService
			.resetPassword(this.data.uuid, password)
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
						'Failed to change user password.';
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
		const password = control.get('password')?.value;
		const confirmPassword = control.get('confirmPassword')?.value;

		if (!password || !confirmPassword) {
			return null;
		}

		return password === confirmPassword
			? null
			: {
					passwordMismatch: true,
				};
	}
}
