import { formatDate } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SalesAgent, SalesAgentService } from './sales-agent.service';

@Component({
	selector: 'app-sales-agent',
	templateUrl: './sales-agent.component.html',
	styleUrls: ['./sales-agent.component.scss']
})
export class SalesAgentComponent implements OnInit {

	isInitialized: boolean;

	formGroup: FormGroup;

	salesAgentCode: string;

	fullName: FormControl<string>;
	dob: FormControl<Date>;
	genderId: FormControl<number>;
	handPhone: FormControl<string>;
	email: FormControl<string>;

	identityCode: FormControl<string>;
	npwp: FormControl<string>;
	bankAccountCode: FormControl<string>;
	bankName: FormControl<string>;

	formSubmitAttempt: boolean;
	isSaving: boolean;

	errorMessage: string;

	selectedTab: string = 'detail';

	constructor(
		private salesAgentService: SalesAgentService,
		private dialogRef: MatDialogRef<SalesAgentComponent>,
		private formBuilder: FormBuilder,
		@Inject(MAT_DIALOG_DATA) private data: { propertyAgentId: number, salesAgentId: number }
	) { }

	ngOnInit(): void {
		this.isInitialized = false;
		this.fullName = new FormControl(null, [Validators.required]);
		this.dob = new FormControl(null);
		this.genderId = new FormControl(1);
		this.handPhone = new FormControl(null);
		this.email = new FormControl(null);

		this.identityCode = new FormControl(null);
		this.npwp = new FormControl(null);
		this.bankAccountCode = new FormControl(null);
		this.bankName = new FormControl(null);

		this.formGroup = this.formBuilder.group({
			fullName: this.fullName,
			dob: this.dob,
			genderId: this.genderId,
			handPhone: this.handPhone,
			email: this.email,

			identityCode: this.identityCode,
			npwp: this.npwp,
			bankAccountCode: this.bankAccountCode,
			bankName: this.bankName,
		})

		if (this.data?.salesAgentId) {
			this.getSalesAgent();
		} else {
			this.isInitialized = true;
		}
	}

	getSalesAgent() {
		return this.salesAgentService.getSalesAgent(this.data?.propertyAgentId, this.data?.salesAgentId)
			.toPromise()
			.then((salesAgent: SalesAgent) => {
				this.salesAgentCode = salesAgent.salesAgentCode;
				this.formGroup.setValue({
					fullName: salesAgent.fullName,
					dob: salesAgent.dob,
					genderId: salesAgent.genderId,
					handPhone: salesAgent.handPhone,
					email: salesAgent.email,

					identityCode: salesAgent.identityCode,
					npwp: salesAgent.npwp,
					bankAccountCode: salesAgent.bankAccountCode,
					bankName: salesAgent.bankName
				})
				this.isInitialized = true;
			})
	}

	getSalesAgentUnits() {

	}

	submit() {
		this.formSubmitAttempt = true;
		this.isSaving = true;

		if (this.formGroup.invalid) {
			this.isSaving = false;
			this.errorMessage = 'Please fill in all required field';
			return;
		}

		const data = this.formGroup.value;
		data.dob = formatDate(data.dob, 'yyyy-MM-dd', 'en');
		if (this.data?.salesAgentId) {
			this.salesAgentService.updateSalesAgent(this.data.propertyAgentId, this.data.salesAgentId, data)
				.subscribe(result => {
					this.isSaving = false;
					this.dialogRef.close(true);
				})
		} else {
			this.salesAgentService.insertSalesAgent(this.data.propertyAgentId, data)
				.subscribe(result => {
					this.isSaving = false;
					this.dialogRef.close(true);
				})
		}
	}

}
