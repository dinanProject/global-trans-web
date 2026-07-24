import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DetailService, Employee, Gender, IdentityCodeType, MaritalStatus, Nationality, Religion } from './detail.service';

@Component({
	selector: 'app-detail',
	templateUrl: './detail.component.html',
	styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {

	employeeId: number;
	personId: number;

	formGroup: UntypedFormGroup;
	fullName: UntypedFormControl;
	genderId: UntypedFormControl;
	religionId: UntypedFormControl;
	dob: UntypedFormControl;
	identityCode: UntypedFormControl;
	identityCodeTypeId: UntypedFormControl;
	identityImagePath: UntypedFormControl;
	maritalStatusId: UntypedFormControl;
	nationalityId: UntypedFormControl;
	homePhone: UntypedFormControl;
	handPhone: UntypedFormControl;
	identityAddress: UntypedFormControl;
	mailingAddress: UntypedFormControl;
	email: UntypedFormControl;
	employeeCode: UntypedFormControl;
	occupationId: UntypedFormControl;
	supervisorId: UntypedFormControl;
	joinDate: UntypedFormControl;
	resignDate: UntypedFormControl;

	occupationName: string;
	departmentName: string;
	companyName: string;

	genders: Gender[];
	religions: Religion[];
	identityCodeTypes: IdentityCodeType[];
	maritalStatuses: MaritalStatus[];
	nationalities: Nationality[];

	isInitialized: boolean;

	constructor(
		private activatedRoute: ActivatedRoute,
		private detailService: DetailService,
		private formBuilder: UntypedFormBuilder
	) { }

	ngOnInit(): void {
		this.isInitialized = false;
		const employeeId = this.activatedRoute.snapshot.paramMap.get('employeeId');
		if (employeeId !== 'new') {
			this.employeeId = +employeeId;
		}

		this.initForm();
		this.getGenders()
			.then(() => this.getReligions())
			.then(() => this.getIdentityCodeTypes())
			.then(() => this.getMaritalStatuses())
			.then(() => this.getNationalities())
			.then(() => this.getEmployee());
	}

	initForm() {
		this.fullName = new UntypedFormControl();
		this.genderId = new UntypedFormControl(1);
		this.religionId = new UntypedFormControl(1);
		this.dob = new UntypedFormControl();
		this.identityCode = new UntypedFormControl();
		this.identityCodeTypeId = new UntypedFormControl(1);
		this.identityImagePath = new UntypedFormControl();
		this.maritalStatusId = new UntypedFormControl(1);
		this.nationalityId = new UntypedFormControl(1);
		this.homePhone = new UntypedFormControl();
		this.handPhone = new UntypedFormControl();
		this.identityAddress = new UntypedFormControl();
		this.mailingAddress = new UntypedFormControl();
		this.email = new UntypedFormControl();
		this.employeeCode = new UntypedFormControl();
		this.occupationId = new UntypedFormControl();
		this.supervisorId = new UntypedFormControl();
		this.joinDate = new UntypedFormControl();
		this.resignDate = new UntypedFormControl();

		this.formGroup = this.formBuilder.group({
			fullName: this.fullName,
			genderId: this.genderId,
			religionId: this.religionId,
			dob: this.dob,
			identityCode: this.identityCode,
			identityCodeTypeId: this.identityCodeTypeId,
			identityImagePath: this.identityImagePath,
			maritalStatusId: this.maritalStatusId,
			nationalityId: this.nationalityId,
			homePhone: this.homePhone,
			handPhone: this.handPhone,
			identityAddress: this.identityAddress,
			mailingAddress: this.mailingAddress,
			email: this.email,
			employeeCode: this.employeeCode,
			occupationId: this.occupationId,
			supervisorId: this.supervisorId,
			joinDate: this.joinDate,
			resignDate: this.resignDate
		})
	}

	getEmployee() {
		if (!this.employeeId) {
			this.isInitialized = true;
			return;
		}

		return this.detailService.getEmployee(this.employeeId)
			.toPromise()
			.then((employee: Employee) => {
				console.log('employee', employee);
				this.formGroup.setValue({
					fullName: employee.fullName,
					genderId: employee.genderId,
					religionId: employee.religionId,
					dob: employee.dob,
					identityCode: employee.identityCode,
					identityCodeTypeId: employee.identityCodeTypeId,
					identityImagePath: employee.identityImagePath,
					maritalStatusId: employee.maritalStatusId,
					nationalityId: employee.nationalityId,
					homePhone: employee.homePhone,
					handPhone: employee.handPhone,
					identityAddress: employee.identityAddress,
					mailingAddress: employee.mailingAddress,
					email: employee.email,
					employeeCode: employee.employeeCode,
					occupationId: employee.occupationId,
					supervisorId: employee.supervisorId,
					joinDate: employee.joinDate,
					resignDate: employee.resignDate
				});
				this.isInitialized = true;
			});
	}

	getGenders() {
		return this.detailService.getGenders()
			.toPromise()
			.then((genders: Gender[]) => {
				this.genders = genders;
			});
	}

	getReligions() {
		return this.detailService.getReligions()
			.toPromise()
			.then((religions: Religion[]) => {
				this.religions = religions;
			});
	}

	getIdentityCodeTypes() {
		return this.detailService.getIdentityCodeTypes()
			.toPromise()
			.then((identityCodeTypes: IdentityCodeType[]) => {
				this.identityCodeTypes = identityCodeTypes;
			});
	}

	getMaritalStatuses() {
		return this.detailService.getMaritalStatuses()
			.toPromise()
			.then((maritalStatuses: MaritalStatus[]) => {
				this.maritalStatuses = maritalStatuses;
			});
	}

	getNationalities() {
		return this.detailService.getNationalities()
			.toPromise()
			.then((nationalities: Nationality[]) => {
				this.nationalities = nationalities;
			});
	}

	dateChanged(e: Event) {

	}

	submit() {

	}
}
