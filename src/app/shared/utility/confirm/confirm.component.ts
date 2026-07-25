import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';

@Component({
	selector: 'app-confirm',
	templateUrl: './confirm.component.html',
	styleUrls: ['./confirm.component.scss']
})
export class ConfirmComponent implements OnInit {

	title: string;
	description: string;
	showReason: boolean;

	formGroup: FormGroup;
	reason: FormControl<string>;
	formSubmitAttempt: boolean = false;

	constructor(
		@Inject(MAT_DIALOG_DATA) private data: { title: string, description: string, showReason?: boolean },
		private dialogRef: MatDialogRef<ConfirmComponent>,
		private formBuilder: FormBuilder
	) { }

	ngOnInit(): void {
		this.title = this.data.title;
		this.description = this.data.description;
		this.showReason = this.data.showReason;
		if (this.showReason) {
			this.reason = new FormControl(null, [Validators.required]);
			this.formGroup = this.formBuilder.group({
				reason: this.reason
			})
		}
	}

	confirm() {
		this.formSubmitAttempt = true;
		if (this.showReason) {
			if (this.formGroup.invalid) {
				console.log(this.reason.errors);
				return;
			}

			return this.dialogRef.close(this.formGroup.value);
		}
		this.dialogRef.close(true);
	}

}
