import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AddService, Source } from './add.service';

@Component({
	selector: 'app-add',
	templateUrl: './add.component.html',
	styleUrls: ['./add.component.scss']
})
export class AddComponent implements OnInit {

	formGroup: UntypedFormGroup;
	leadName: UntypedFormControl;
	locationName: UntypedFormControl;
	phoneNumber: UntypedFormControl;
	sourceId: UntypedFormControl;

	sources: Source[] = [];
	isInitialized: boolean;
	formSubmitAttempt: boolean;

	constructor(
		private formBuilder: UntypedFormBuilder,
		private dialogRef: MatDialogRef<AddComponent>,
		private addService: AddService
	) { }

	ngOnInit(): void {
		this.isInitialized = false;
		this.formSubmitAttempt = false;
		this.leadName = new UntypedFormControl('', [Validators.required]);
		this.locationName = new UntypedFormControl('', [Validators.required]);
		this.phoneNumber = new UntypedFormControl('', [Validators.required]);
		this.sourceId = new UntypedFormControl(1);

		this.formGroup = this.formBuilder.group({
			leadName: this.leadName,
			locationName: this.locationName,
			phoneNumber: this.phoneNumber,
			sourceId: this.sourceId,
		})

		this.getSources();
	}

	getSources() {
		return this.addService.getSources()
			.toPromise()
			.then((sources: Source[]) => {
				this.sources = sources;
				this.isInitialized = true;
			})
	}

	submit() {
		this.formSubmitAttempt = true;
		if (this.formGroup.invalid) {
			return;
		}

		this.addService.insert(this.formGroup.value)
			.toPromise()
			.then(() => {
				this.dialogRef.close(true);
			});
	}
}
