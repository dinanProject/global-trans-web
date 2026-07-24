import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { debounceTime, switchMap, tap } from 'rxjs/operators';
import { Client, Gender, IdentityCodeType, MaritalStatus, Nationality, RegistrationFormService, Religion } from './registration-form.service';

@Component({
	selector: 'app-registration-form',
	templateUrl: './registration-form.component.html',
	styleUrls: ['./registration-form.component.scss']
})
export class RegistrationFormComponent implements OnInit {

	clientName: string;
	clientSuffix: string;
	clientLogoPath: string;

	formGroup: FormGroup;
	userName: FormControl<string>;
	fullName: FormControl<string>;
	genderId: FormControl<number>;
	religionId: FormControl<number>;
	dob: FormControl<Date>;
	pob: FormControl<string>;
	identityCode: FormControl<string>;
	identityCodeTypeId: FormControl<number>;
	identityImagePath: FormControl<string>;
	maritalStatusId: FormControl<number>;
	nationalityId: FormControl<number>;
	homePhone: FormControl<string>;
	handPhone: FormControl<string>;
	identityAddress: FormControl<string>;
	mailingAddress: FormControl<string>;
	email: FormControl<string>;

	genders: Gender[];
	religions: Religion[];
	identityCodeTypes: IdentityCodeType[];
	maritalStatuses: MaritalStatus[];
	nationalities: Nationality[];

	isLoading: boolean;
	formSubmitAttempt: boolean;
	isValidating: boolean;
	isInvalid: boolean;
	errorMessage: string;

	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private registrationFormService: RegistrationFormService,
		private formBuilder: FormBuilder
	) { }

	ngOnInit(): void {
		this.isLoading = false;
		this.formSubmitAttempt = false;
		this.initForm();
		this.getClient()
			.then(() => this.getGenders())
			.then(() => this.getReligions())
			.then(() => this.getIdentityCodeTypes())
			.then(() => this.getMaritalStatuses())
			.then(() => this.getNationalities())
			.then(() => this.isLoading = true);
	}

	initForm() {
		this.userName = new FormControl('', [Validators.required]);
		this.fullName = new FormControl('', [Validators.required]);
		this.genderId = new FormControl(1);
		this.religionId = new FormControl(1);
		this.dob = new FormControl(null, [Validators.required]);
		this.pob = new FormControl();
		this.identityCode = new FormControl();
		this.identityCodeTypeId = new FormControl(1);
		this.identityImagePath = new FormControl();
		this.maritalStatusId = new FormControl(1);
		this.nationalityId = new FormControl(1);
		this.homePhone = new FormControl();
		this.handPhone = new FormControl(null, [Validators.required]);
		this.identityAddress = new FormControl();
		this.mailingAddress = new FormControl();
		this.email = new FormControl(null, [Validators.required, Validators.email]);

		this.userName
			.valueChanges
			.pipe(
				tap(() => {
					this.isValidating = true;
				}),
				debounceTime(300),
				tap(() => {
					this.isInvalid = false;
				}),
				switchMap(value => {
					const format = /[ `!@#$%^&*()+\=\[\]{};':"\\|,<>\/?~]/;
					if (format.test(value)) {
						return of({
							isInvalid: true,
							message: "User name cannot contain space nor special characters"
						});
					}

					return this.registrationFormService.validateUserName(value)
						.pipe(switchMap((value) => {
							if (value) {
								return of({
									isInvalid: value,
									message: 'User exists, please find another user name'
								});
							}
							return of({
								isInvalid: false,
								message: ''
							});
						}));
				})
			)
			.subscribe(result => {
				console.log('result', result);
				this.isInvalid = result.isInvalid;
				this.errorMessage = result.message;
				this.isValidating = false;
			});

		this.formGroup = this.formBuilder.group({
			userName: this.userName,
			fullName: this.fullName,
			genderId: this.genderId,
			religionId: this.religionId,
			dob: this.dob,
			pob: this.pob,
			identityCode: this.identityCode,
			identityCodeTypeId: this.identityCodeTypeId,
			identityImagePath: this.identityImagePath,
			maritalStatusId: this.maritalStatusId,
			nationalityId: this.nationalityId,
			homePhone: this.homePhone,
			handPhone: this.handPhone,
			identityAddress: this.identityAddress,
			mailingAddress: this.mailingAddress,
			email: this.email
		})
	}

	getClient() {
		return this.registrationFormService.getClient()
			.toPromise()
			.then((client: Client) => {
				this.clientName = client.clientName;
				this.clientSuffix = client.clientSuffix;
				this.clientLogoPath = client.clientLogoPath;
			});
	}

	getGenders() {
		return this.registrationFormService.getGenders()
			.toPromise()
			.then((genders: Gender[]) => {
				this.genders = genders;
			});
	}

	getReligions() {
		return this.registrationFormService.getReligions()
			.toPromise()
			.then((religions: Religion[]) => {
				this.religions = religions;
			});
	}

	getIdentityCodeTypes() {
		return this.registrationFormService.getIdentityCodeTypes()
			.toPromise()
			.then((identityCodeTypes: IdentityCodeType[]) => {
				this.identityCodeTypes = identityCodeTypes;
			});
	}

	getMaritalStatuses() {
		return this.registrationFormService.getMaritalStatuses()
			.toPromise()
			.then((maritalStatuses: MaritalStatus[]) => {
				this.maritalStatuses = maritalStatuses;
			});
	}

	getNationalities() {
		return this.registrationFormService.getNationalities()
			.toPromise()
			.then((nationalities: Nationality[]) => {
				this.nationalities = nationalities;
			});
	}

	dateChanged(value) {

	}

	submit() {
		this.formSubmitAttempt = true;
		if (this.isInvalid) {
			return;
		}

		if (this.formGroup.invalid) {
			return;
		}

		const data = this.formGroup.value;
		data.dob = formatDate(data.dob, 'yyyy-MM-dd', 'en');
		data.dob2 = formatDate(data.dob, 'ddMMyy', 'en');

		this.isLoading = true;
		this.registrationFormService.insert(data).subscribe(result => {
			this.isLoading = false;
			this.router.navigate(['success'], {
				relativeTo: this.activatedRoute
			});
		});
	}

}
