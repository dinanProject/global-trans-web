import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, NumberValueAccessor, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LinkService, SalesRegistration, SalesInhouseType, Team } from './link.service';

@Component({
	selector: 'app-link',
	templateUrl: './link.component.html',
	styleUrls: ['./link.component.scss']
})
export class LinkComponent implements OnInit {

	isInitialized: boolean;

	clientSuffix: string;
	formGroup: FormGroup;
	salesName: FormControl<string>;
	salesInhouseTypeId: FormControl<number>;
	teamId: FormControl<number>;

	formSubmitAttempt: boolean;

	salesInhouseTypes: SalesInhouseType[];
	teams: Team[];
	// link: string;
	registration: SalesRegistration;

	isSaving: boolean;

	constructor(
		@Inject(MAT_DIALOG_DATA) private data: { registrationId: number },
		private linkService: LinkService,
		private formBuilder: FormBuilder
	) { }

	ngOnInit(): void {
		this.isInitialized = false;
		this.formSubmitAttempt = false;
		this.isSaving = false;

		if (!this.data.registrationId) {
			this.salesName = new FormControl('', [Validators.required]);
			this.salesInhouseTypeId = new FormControl(1, [Validators.required]);
			this.teamId = new FormControl(1, [Validators.required]);
			this.formGroup = this.formBuilder.group({
				salesName: this.salesName,
				salesInhouseTypeId: this.salesInhouseTypeId,
				teamId: this.teamId
			});

			this.getSalesInhouseTypes()
				.then(() => this.getTeams())
				.then(() => {
					this.isInitialized = true;
				})
		} else {
			this.getRegistration()
				.then(() => {
					this.isInitialized = true;
				})
		}
	}

	getRegistration() {
		return this.linkService.getRegistration(this.data.registrationId)
			.toPromise()
			.then((registration: SalesRegistration) => {
				console.log('registration', registration);
				this.registration = registration;
			})
	}

	getSalesInhouseTypes() {
		return this.linkService.getSalesInhouseTypes()
			.toPromise()
			.then((salesInhouseTypes: SalesInhouseType[]) => {
				console.log('salesInhouseTypes', salesInhouseTypes);
				this.salesInhouseTypes = salesInhouseTypes;
				if (salesInhouseTypes) {
					this.salesInhouseTypeId.setValue(salesInhouseTypes[0].salesInhouseTypeId);
				}
			});
	}

	getTeams() {
		return this.linkService.getTeams()
			.toPromise()
			.then((teams: Team[]) => {
				this.teams = teams;
			});
	}

	get appUrl() {
		return window.location.protocol + '://' + window.location.host;
	}

	get link() {
		return this.appUrl + '/sales-registration?token=' + this.registration.token;
	}

	submit() {
		this.formSubmitAttempt = true;
		this.isSaving = true;
		if (this.formGroup.invalid) {
			this.isSaving = false;
			return;
		}

		const data = this.formGroup.value;
		this.linkService.createLink(data).subscribe(result => {
			this.isSaving = false;
			this.data.registrationId = result;
			this.getRegistration();
			// this.dialogRef.close(true);
			console.log('result', result);
			// this.link = this.appUrl + '/sales-registration?token=' + result;
			// this.mode = 'view';
		})
	}

}
