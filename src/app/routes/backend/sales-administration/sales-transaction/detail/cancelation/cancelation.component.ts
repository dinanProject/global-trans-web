import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { CancelationService, CancelationType } from './cancelation.service';

@Component({
	selector: 'app-cancelation',
	templateUrl: './cancelation.component.html',
	styleUrls: ['./cancelation.component.scss']
})
export class CancelationComponent implements OnInit {

	isInitialized: boolean = false;
	cancelationTypes: CancelationType[] = [];

	formGroup: FormGroup;
	cancelationDate: FormControl<Date>;
	cancelationTypeId: FormControl<number>;
	cancelationNotes: FormControl<string>;
	formSubmitAttempt: boolean = false;
	errorMessage: string = '';

	constructor(
		private cancelationService: CancelationService,
		private formBuilder: FormBuilder,
		private dialogRef: MatDialogRef<CancelationComponent>
	) { }

	ngOnInit(): void {
		this.cancelationDate = new FormControl(new Date(), [Validators.required]);
		this.cancelationTypeId = new FormControl(1, [Validators.required]);
		this.cancelationNotes = new FormControl(null, [Validators.required]);

		this.formGroup = this.formBuilder.group({
			cancelationDate: this.cancelationDate,
			cancelationTypeId: this.cancelationTypeId,
			cancelationNotes: this.cancelationNotes
		})

		this.getCancelationTypes()
			.then(() => this.isInitialized = true);
	}

	getCancelationTypes() {
		return this.cancelationService.getCancelationTypes()
			.toPromise()
			.then((cts: CancelationType[]) => {
				console.log('cts', cts)
				this.cancelationTypes = cts;
			})
	}

	submit() {
		this.formSubmitAttempt = true;
		if (this.formGroup.invalid) {
			this.errorMessage = 'Please fill in all required field';
			return;
		}

		const data = this.formGroup.value;
		data.cancelationDate = formatDate(data.cancelationDate, 'yyyy-MM-dd', 'en');
		this.dialogRef.close(data);
	}

}
