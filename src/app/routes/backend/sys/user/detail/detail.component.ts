import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { ActivatedRoute } from '@angular/router';
import { Client, Company, DetailService, Role, User } from './detail.service';

@Component({
	selector: 'app-detail',
	templateUrl: './detail.component.html',
	styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {

	user: User;
	// roles: MatTableDataSource<Role> = new MatTableDataSource();
	// roleDisplayedColumns = ['check', 'roleName'];

	roles: Role[] = [];

	// clients: Client[] = [];
	companies: Company[] = [];

	formGroup: UntypedFormGroup;
	fullName: UntypedFormControl;

	userName: UntypedFormControl;
	defaultRoute: UntypedFormControl;

	isInitialized: boolean;
	isPasswordResetting: boolean;
	isUserDisabling: boolean;
	isUserEnabling: boolean;
	isUnlocking: boolean;

	formSubmitAttempt: boolean;

	// loadedClientIds: number[] = [];
	loadedCompanyIds: number[] = [];
	loadedRoleIds: number[] = [];

	isSaving: boolean;

	constructor(
		private activatedRoute: ActivatedRoute,
		private detailService: DetailService,
		private formBuilder: UntypedFormBuilder
	) { }

	ngOnInit(): void {
		this.isInitialized = false;
		const userId = +this.activatedRoute.snapshot.paramMap.get('userId');
		this.getUser(userId);
	}

	getUser(userId: number) {
		return new Promise<void>((resolve, reject) => {
			this.detailService.getUser(userId).subscribe((data: { user: User, roles: Role[], companies: Company[] }) => {
				console.log('data', data);
				this.companies = data.companies;
				this.loadedCompanyIds = [];
				this.loadedCompanyIds.push(...this.getCheckedCompanyIds(this.companies))
				this.roles = data.roles;
				this.loadedRoleIds = data.roles.filter((role: Role) => role.isChecked).map((r: Role) => r.roleId);
				this.user = data.user;

				this.defaultRoute = new UntypedFormControl(this.user.defaultRoute, [Validators.required]);
				this.userName = new UntypedFormControl(this.user.userName, [Validators.required]);
				this.formGroup = this.formBuilder.group({
					userName: this.userName,
					defaultRoute: this.defaultRoute
				})

				this.isInitialized = true;
				resolve();
			})
		});
	}

	toggleRole(role: Role) {
		role.isChecked = !role.isChecked;
	}

	toggleCompany(row: Company) {
		row.isChecked = !row.isChecked;
	}

	resetPassword() {
		this.isPasswordResetting = true;
		this.detailService.resetPassword(this.user.userId).subscribe(result => {
			setTimeout(() => {
				this.isPasswordResetting = false;
				this.ngOnInit();
			}, 1000);
		})
	}

	unlockUser() {
		this.isUnlocking = true;
		this.detailService.unlockUser(this.user.userId).subscribe(result => {
			setTimeout(() => {
				this.isUnlocking = false;
				this.ngOnInit();
			}, 1000);
		})
	}

	enableUser() {
		this.isUserEnabling = true;
		this.detailService.enableUser(this.user.userId).subscribe(result => {
			setTimeout(() => {
				this.isUserEnabling = false;
				this.ngOnInit();
			}, 1000);
		})
	}

	disableUser() {
		this.isUserDisabling = true;
		this.detailService.disableUser(this.user.userId).subscribe(result => {
			setTimeout(() => {
				this.isUserDisabling = false;
				this.ngOnInit();
			}, 1000);
		})
	}

	change(client: Client, e: MatCheckboxChange) {
		client.companies.forEach((c: Company) => {
			c.isChecked = e.checked;
			c.isIndeterminate = false;
			this.checkChild(c, e.checked);
		});
		client.isChecked = e.checked;
		client.isIndeterminate = false;
	}

	checkChild(company: Company, value: boolean) {
		for (const c of company.child) {
			c.isChecked = value;
			c.isIndeterminate = false;
			this.checkChild(c, value);
		}
	}

	getCheckedCompanyIds(companies: Company[]) {
		const result = [];
		for (const company of companies) {
			if (company.isChecked || company.isIndeterminate) {
				result.push(company.companyId);
			}
			if (company.child.length > 0) {
				result.push(...this.getCheckedCompanyIds(company.child))
			}
		}
		return result;
	}

	save() {
		this.isSaving = true;
		this.formSubmitAttempt = true;
		if (this.formGroup.invalid) {
			this.isSaving = false;
			return;
		}

		const data = this.formGroup.value;

		const checkedRoles = this.roles.filter((role: Role) => role.isChecked).map((r: Role) => r.roleId);
		data.addedRoles = checkedRoles.filter(roleId => !this.loadedRoleIds.includes(roleId));
		data.deletedRoles = this.loadedRoleIds.filter(roleId => !checkedRoles.includes(roleId));

		const checkedCompanies = [];
		checkedCompanies.push(...this.getCheckedCompanyIds(this.companies))
		data.addedCompanies = checkedCompanies.filter(companyId => !this.loadedCompanyIds.includes(companyId));
		data.deletedCompanies = this.loadedCompanyIds.filter(companyId => !checkedCompanies.includes(companyId));

		this.detailService.update(this.user.userId, data).subscribe(() => {
			setTimeout(() => {
				this.isSaving = false;
				this.ngOnInit();
			}, 500)
		})
		this.isSaving = false;
	}
}
