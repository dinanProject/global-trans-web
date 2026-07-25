import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { SessionService } from 'src/app/core/services/session.service';
import { LoginService } from './login.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    standalone: false
})
export class LoginComponent implements OnInit {
	formGroup!: FormGroup;
	isSubmitting = false;
	errorMessage = '';
	returnUrl = '/backend';

	constructor(
		private formBuilder: FormBuilder,
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private loginService: LoginService,
		private sessionService: SessionService,
	) {}

	ngOnInit(): void {
		this.returnUrl =
			this.activatedRoute.snapshot.queryParamMap.get('returnUrl') ||
			'/backend';

		if (this.sessionService.isAuth()) {
			this.router.navigateByUrl(this.returnUrl);
			return;
		}

		this.formGroup = this.formBuilder.group({
			email: ['', [Validators.required, Validators.email]],
			password: ['', [Validators.required]],
		});
	}

	submit(): void {
		if (this.formGroup.invalid || this.isSubmitting) {
			this.formGroup.markAllAsTouched();
			return;
		}

		this.isSubmitting = true;
		this.errorMessage = '';

		this.loginService.login(this.formGroup.getRawValue()).subscribe({
			next: (response) => {
				this.sessionService.setSession({
					user: response.user,
					accessToken: response.accessToken,
					refreshToken: response.refreshToken,
				});

				this.router.navigateByUrl(this.returnUrl);
			},
			error: (error) => {
				this.isSubmitting = false;

				this.errorMessage =
					error?.error?.meta?.message ||
					error?.error?.message ||
					error?.message ||
					'Email atau password tidak valid.';
			},
		});
	}
}
