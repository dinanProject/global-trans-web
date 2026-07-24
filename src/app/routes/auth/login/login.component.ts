import { Component, OnInit, Injectable } from '@angular/core';
import { UntypedFormGroup, Validators, UntypedFormBuilder, UntypedFormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginService } from './login.service';
import { Title } from '@angular/platform-browser';
import { Client, SessionService, User } from 'src/app/services/session.service';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

	formGroup: UntypedFormGroup;
	userName: UntypedFormControl;
	password: UntypedFormControl;

	formSubmitAttempt: boolean;
	errorMessage: string;
	returnUrl: string;

	constructor(
		private activatedRoute: ActivatedRoute,
		private formBuilder: UntypedFormBuilder,
		private loginService: LoginService,
		private sessionService: SessionService,
		private router: Router,
		private titleService: Title
	) {
	}

	ngOnInit() {
		this.titleService.setTitle('Authentication');
		this.returnUrl = this.activatedRoute.snapshot.queryParamMap.get('return-url') || '';
		if (this.sessionService.isAuth()) {
			return this.router.navigateByUrl(this.returnUrl);
		}
		this.userName = new UntypedFormControl('', [Validators.required]);
		this.password = new UntypedFormControl('', [Validators.required]);
		this.formGroup = this.formBuilder.group({
			userName: this.userName,
			password: this.password
		});
	}

	submit() {
		this.formSubmitAttempt = true;
		this.errorMessage = '';
		if (this.formGroup.invalid) {
			this.errorMessage = 'Please fill both the username and password field';
			return;
		}

		const credentials = this.formGroup.value;
		this.loginService.login(credentials.userName, credentials.password)
			.subscribe((result: { user: User, client: Client }) => {
				this.sessionService.setUser(result.user);
				this.sessionService.setClient(result.client);
				this.router.navigateByUrl(this.returnUrl || result.user.defaultRoute || '/backend');
			}, err => {
				this.errorMessage = err.error.data;
			})
	}

}
