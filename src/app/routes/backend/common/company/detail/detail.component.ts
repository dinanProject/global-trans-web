import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CompanyService } from '../company.service';
import { DetailService } from './detail.service';

export enum DialogAction {
	Add,
	Edit
}

@Component({
	selector: 'app-detail',
	templateUrl: './detail.component.html',
	styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {

	formGroup: UntypedFormGroup;
	companyName: UntypedFormControl;
	remark: UntypedFormControl;
	address: UntypedFormControl;

	companyId: number;
	title = 'Add Company';

	formSubmitAttempt: boolean;

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: {
			dialogAction: DialogAction,
			companyId: number,
			name: string
		},
		private dialogRef: MatDialogRef<DetailComponent>,
		private detailService: DetailService,
		private formBuilder: UntypedFormBuilder
	) { }

	ngOnInit(): void {
		this.formSubmitAttempt = false;
		this.companyId = this.data.companyId;
		if (this.data.dialogAction === DialogAction.Edit) {
			this.title = 'Edit Company';
		}
		this.initForm()
			.then(() => this.getCompany());
	}

	initForm() {
		return new Promise<void>((resolve, reject) => {
			this.companyName = new UntypedFormControl('', [Validators.required]);
			this.remark = new UntypedFormControl('');
			this.address = new UntypedFormControl('');
			this.formGroup = this.formBuilder.group({
				companyName: this.companyName,
				remark: this.remark,
				address: this.address
			});
			resolve();
		});
	}

	getCompany() {
		return new Promise<void>((resolve, reject) => {
			if (!this.companyId) {
				return resolve();
			}
			this.detailService.getCompany(this.companyId).subscribe(result => {
				console.log('getCompany result', result);
				const company = result;
				this.formGroup.setValue({
					companyName: company.companyName,
					remark: company.remark,
					address: company.address
				})
				resolve();
			});
		});
	}

	submit() {
		this.formSubmitAttempt = true;
		if (this.formGroup.invalid) {
			return;
		}

		const data = this.formGroup.value;
		if (this.companyId) {
			this.detailService.updateCompany(this.companyId, data).subscribe(() => {
				this.dialogRef.close(true);
			})
		} else {
			this.detailService.insertCompany(data).subscribe(() => {
				this.dialogRef.close(true);
			})
		}
	}
}
