import { Component, Inject, InjectionToken, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Company } from '../company.component';
import { DetailService } from './detail.service';

export enum DialogType {
	Company,
	Department,
	Occupation
}

export enum DialogAction {
	Add,
	Edit
}

export interface DialogData {
	dialogAction: DialogAction;
	dialogType: DialogType;
	id: number;
	name: string;
}

@Component({
	selector: 'app-detail',
	templateUrl: './detail.component.html',
	styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {

	dialogAction: DialogAction;
	dialogType: DialogType;
	dialogTitle: string;

	formGroup: UntypedFormGroup;

	name: UntypedFormControl;
	type: UntypedFormControl;
	remark: UntypedFormControl;
	address: UntypedFormControl;

	id: number;

	parentId: number;
	parentName: string;

	isInitialized: boolean;
	formSubmitAttempt: boolean;

	constructor(
		@Inject(MAT_DIALOG_DATA) private data: DialogData,
		private formBuilder: UntypedFormBuilder,
		private dialogRef: MatDialogRef<DetailComponent>,
		private detailService: DetailService
	) { }

	ngOnInit(): void {
		this.isInitialized = false;
		const data = this.data;
		this.dialogAction = this.data.dialogAction;
		this.dialogType = this.data.dialogType;
		this.dialogTitle = `${DialogAction[this.dialogAction]} ${DialogType[this.dialogType]}`;
		this.initForm();
		if (this.dialogAction === DialogAction.Add) {
			this.parentId = data.id;
			this.parentName = data.name;
			this.isInitialized = true;
		} else {
			this.id = data.id;
			if (this.dialogType === DialogType.Company) {
				this.getCompany();
			} else if (this.dialogType === DialogType.Occupation) {

			} else {

			}
		}
		console.log('data', data)
	}

	initForm() {
		let formGroup;
		let dialogSize = ['300px', '400px'];
		if (this.dialogType === DialogType.Company) {
			this.name = new UntypedFormControl('', [Validators.required]);
			this.remark = new UntypedFormControl('');
			this.address = new UntypedFormControl('');
			formGroup = {
				name: this.name,
				remark: this.remark,
				address: this.address
			}
			dialogSize = ['360px', '440px'];
		}

		if (this.dialogType === DialogType.Department) {
			this.name = new UntypedFormControl('', [Validators.required]);
			this.remark = new UntypedFormControl('');
			this.address = new UntypedFormControl('');
			formGroup = {
				name: this.name,
				remark: this.remark,
				type: this.type,
				address: this.address
			}
			dialogSize = ['360px', '398px'];
		}

		this.formGroup = this.formBuilder.group(formGroup);
		this.dialogRef.updateSize(...dialogSize);
	}

	getDepartmentTypes() {

	}

	getCompany() {
		this.detailService.getCompany(this.id).subscribe((company: Company) => {
			console.log(company);
			this.parentId = company.parentId;
			this.parentName = company.parentName || 'No Parent';
			this.formGroup.setValue({
				name: company.companyName,
				remark: company.remark,
				address: company.address
			})

			this.isInitialized = true;
		})
	}

	save() {
		this.formSubmitAttempt = true;
		if (this.formGroup.invalid) {
			return;
		}

		const data = this.formGroup.value;
		if (this.dialogType === DialogType.Company) {
			if (this.dialogAction === DialogAction.Add) {
				data.parentId = this.parentId;
				this.detailService.insertCompany(data).subscribe(result => {
					this.dialogRef.close(true);
				})
			} else {
				this.detailService.updateCompany(this.id, data).subscribe(result => {
					this.dialogRef.close(true);
				})
			}
		}
	}

}
