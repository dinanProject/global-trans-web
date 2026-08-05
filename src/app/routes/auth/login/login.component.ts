import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { NonNullableFormBuilder, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';

import { SessionService } from 'src/app/core/services/session.service';
import { LoginService } from './login.service';

interface LoginErrorResponse {
	message?: string;
	meta?: {
		message?: string;
	};
}

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.scss'],
	standalone: false,
})
export class LoginComponent implements OnInit {
	private readonly formBuilder = inject(NonNullableFormBuilder);
	private readonly activatedRoute = inject(ActivatedRoute);
	private readonly router = inject(Router);
	private readonly loginService = inject(LoginService);
	private readonly sessionService = inject(SessionService);
	private readonly destroyRef = inject(DestroyRef);

	readonly formGroup = this.formBuilder.group({
		email: ['', [Validators.required, Validators.email]],
		password: ['', [Validators.required]],
	});

	readonly isSubmitting = signal(false);
	readonly errorMessage = signal('');

	private returnUrl = '/home';

	get email() {
		return this.formGroup.controls.email;
	}

	get password() {
		return this.formGroup.controls.password;
	}

	ngOnInit(): void {
		const requestedReturnUrl =
			this.activatedRoute.snapshot.queryParamMap.get('returnUrl');

		this.returnUrl = this.getSafeReturnUrl(requestedReturnUrl);
		const reason = this.activatedRoute.snapshot.queryParamMap.get('reason');

		if (reason === 'session-expired') {
			this.errorMessage.set(
				'Sesi Anda sudah berakhir. Silakan login kembali.',
			);
		}

		if (this.sessionService.isAuth()) {
			void this.router.navigateByUrl(this.returnUrl);
		}
	}

	submit(): void {
		if (this.formGroup.invalid) {
			this.formGroup.markAllAsTouched();
			return;
		}

		if (this.isSubmitting()) {
			return;
		}

		this.isSubmitting.set(true);
		this.errorMessage.set('');

		this.loginService
			.login(this.formGroup.getRawValue())
			.pipe(
				finalize(() => {
					this.isSubmitting.set(false);
				}),
				takeUntilDestroyed(this.destroyRef),
			)
			.subscribe({
				next: (response) => {
					this.sessionService.setSession({
						user: response.user,
						accessToken: response.accessToken,
						refreshToken: response.refreshToken,
					});

					void this.router.navigateByUrl(this.returnUrl);
				},
				error: (error: HttpErrorResponse) => {
					this.errorMessage.set(this.getErrorMessage(error));
				},
			});
	}

	private getSafeReturnUrl(returnUrl: string | null): string {
		if (
			!returnUrl ||
			!returnUrl.startsWith('/') ||
			returnUrl.startsWith('//')
		) {
			return '/home';
		}
		if (returnUrl === '/main') {
			return '/home';
		}
		if (returnUrl.startsWith('/main/')) {
			return returnUrl.replace(/^\/main/, '');
		}
		if (
			returnUrl === '/not-found' ||
			returnUrl === '/unauthorized' ||
			returnUrl.startsWith('/auth')
		) {
			return '/home';
		}
		return returnUrl;
	}

	private getErrorMessage(error: HttpErrorResponse): string {
		const responseError = error.error as
			| LoginErrorResponse
			| null
			| undefined;

		return (
			responseError?.meta?.message ||
			responseError?.message ||
			error.message ||
			'Email atau password tidak valid.'
		);
	}
}
