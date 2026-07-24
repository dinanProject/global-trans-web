import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DetailService } from './detail.service';

@Component({
	selector: 'app-detail',
	templateUrl: './detail.component.html',
	styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {

	formGroup: UntypedFormGroup;
	lookupId: UntypedFormControl;
	lookupName: UntypedFormControl;
	lookupValue: UntypedFormControl;
	lookupGroup: UntypedFormControl;
	remark: UntypedFormControl;

	title = 'Add Lookup';
	errorMessage = '';

	formSubmitAttempt: boolean;

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: any,
		private dialogRef: MatDialogRef<DetailComponent>,
		private detailService: DetailService,
		private formBuilder: UntypedFormBuilder
	) { }

	ngOnInit(): void {
		this.formSubmitAttempt = false;
		if (this.data.lookupId) {
			this.title = 'Edit Lookup';
		}
		this.initForm()
			.then(() => this.getLookup());
	}

	initForm() {
		return new Promise<void>((resolve, reject) => {
			this.lookupId = new UntypedFormControl('', [Validators.required]);
			this.lookupName = new UntypedFormControl('', [Validators.required]);
			this.lookupValue = new UntypedFormControl('', [Validators.required]);
			this.lookupGroup = new UntypedFormControl('', [Validators.required]);
			this.remark = new UntypedFormControl('');
			this.formGroup = this.formBuilder.group({
				lookupId: this.lookupId,
				lookupName: this.lookupName,
				lookupValue: this.lookupValue,
				lookupGroup: this.lookupGroup,
				remark: this.remark
			});
			resolve();
		});
	}

	getLookup() {
		return new Promise<void>((resolve, reject) => {
			console.log('this.data', this.data);
			if (!this.data.lookupId) {
				return resolve();
			}
			this.detailService.getLookup(this.data).subscribe(result => {
				console.log('getLookup result', result);
				const lookup = result;
				this.formGroup.setValue({
					lookupId: lookup.lookupId,
					lookupName: lookup.lookupName,
					lookupValue: lookup.lookupValue,
					lookupGroup: lookup.lookupGroup,
					remark: lookup.remark
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
		if (this.data.lookupId) {
			this.detailService.updateLookup(this.data.lookupId, this.data.lookupName, this.data.lookupGroup, data).subscribe(() => {
				this.dialogRef.close(true);
			}, err => {
				console.log('err', err);
				this.errorMessage = err.error.data;
			})
		} else {
			this.detailService.insertLookup(data).subscribe(() => {
				this.dialogRef.close(true);
			}, err => {
				console.log('err', err);
				this.errorMessage = err.error.data;
			})
		}
	}
}
