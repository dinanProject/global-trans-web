import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-delete-reason',
    templateUrl: './delete-reason.component.html',
    styleUrls: ['./delete-reason.component.scss'],
    standalone: false
})
export class DeleteReasonComponent implements OnInit {

	title: string;

	formGroup: FormGroup;
	reason: FormControl<string>;
	formSubmitAttempt: boolean;
	errorMessage: string;

	constructor(
		private dialogRef: MatDialogRef<DeleteReasonComponent>,
		private formBuilder: FormBuilder,
		@Inject(MAT_DIALOG_DATA) private data: { title: string }
	) { }

	ngOnInit(): void {
		this.title = this.data?.title;
		this.formSubmitAttempt = false;
		this.reason = new FormControl(null, [Validators.required]);
		this.formGroup = this.formBuilder.group({
			reason: this.reason
		});
	}

	submit() {
		this.formSubmitAttempt = true;
		if (this.formGroup.invalid) {
			this.errorMessage = 'Please insert reason';
			return;
		}

		this.dialogRef.close(this.reason.value);
	}

}
