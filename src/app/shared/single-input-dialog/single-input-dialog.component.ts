import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
	selector: 'app-single-input-dialog',
	templateUrl: './single-input-dialog.component.html',
	styleUrls: ['./single-input-dialog.component.scss']
})
export class SingleInputDialogComponent implements OnInit {

	type: 'input' | 'textaera' | 'datepicker' = 'input';
	title: string;
	label: string;
	placeholder: string;

	formGroup: FormGroup;
	formControl: FormControl<any>;
	formSubmitAttempt: boolean;

	constructor(
		private formBuilder: FormBuilder,
		private dialogRef: MatDialogRef<SingleInputDialogComponent>,
		@Inject(MAT_DIALOG_DATA) private data: { type: 'input' | 'textaera' | 'datepicker'; title: string, label: string, placeholder?: string, initialValue?: any }
	) { }

	ngOnInit(): void {
		this.formSubmitAttempt = false;
		this.formControl = new FormControl(null, [Validators.required]);
		this.formGroup = this.formBuilder.group({
			formControl: this.formControl
		})

		this.type = this.data.type;
		this.title = this.data.title;
		this.label = this.data.label;
		this.placeholder = this.data.placeholder;

		// if (this.type === 'datepicker') {
		this.formControl.setValue(this.data.initialValue || null);
		// }
	}

	submit() {
		this.formSubmitAttempt = true;
		if (this.formGroup.invalid) {
			return;
		}

		const data = this.formControl.value;
		this.dialogRef.close(data);
	}
}
