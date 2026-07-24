import { formatDate } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UtilityService } from 'src/app/services/utility.service';
import { DetailService, PropertyAgent, SalesAgent } from './detail.service';

@Component({
	selector: 'app-detail',
	templateUrl: './detail.component.html',
	styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {

	isInitialized: boolean;

	formGroup: FormGroup;

	salesAgentId: number;
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

	propertyAgentId: FormControl<number>;

	formSubmitAttempt: boolean;
	isSaving: boolean;

	errorMessage: string;

	selectedTab: string = 'detail';

	propertyAgents: PropertyAgent[] = [];

	constructor(
		private detailService: DetailService,
		private dialogRef: MatDialogRef<DetailComponent>,
		private formBuilder: FormBuilder,
		private utilityService: UtilityService,
		@Inject(MAT_DIALOG_DATA) private data: { salesAgentId: number }
	) { }

	ngOnInit(): void {
		this.isInitialized = false;
		this.salesAgentId = this.data?.salesAgentId;
		this.fullName = new FormControl(null, [Validators.required]);
		this.dob = new FormControl(null);
		this.genderId = new FormControl(1);
		this.handPhone = new FormControl(null);
		this.email = new FormControl(null);

		this.identityCode = new FormControl(null);
		this.npwp = new FormControl(null);
		this.bankAccountCode = new FormControl(null);
		this.bankName = new FormControl(null);
		this.propertyAgentId = new FormControl(null, [Validators.min(1)]);

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
			propertyAgentId: this.propertyAgentId,
		})

		this.getPropertyAgents()
			.then(() => {
				if (this.salesAgentId) {
					this.getSalesAgent();
				} else {
					this.isInitialized = true;
				}
			});
	}

	getPropertyAgents() {
		return this.detailService.getPropertyAgents()
			.toPromise()
			.then((propertyAgents: PropertyAgent[]) => {
				this.propertyAgents = propertyAgents;
			});
	}

	getSalesAgent() {
		return this.detailService.getSalesAgent(this.salesAgentId)
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
					bankName: salesAgent.bankName,
					propertyAgentId: salesAgent.propertyAgentId,
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
		if (this.salesAgentId) {
			this.detailService.updateSalesAgent(this.data.salesAgentId, data)
				.subscribe(result => {
					this.isSaving = false;
					this.dialogRef.close(true);
				})
		} else {
			this.detailService.insertSalesAgent(data)
				.subscribe(result => {
					this.isSaving = false;
					this.dialogRef.close(true);
				})
		}
	}

	deleteSalesAgent() {
		this.utilityService.deleteReason()
			.then((deletedReason) => this.detailService.deleteSalesAgent(this.salesAgentId, deletedReason)
				.toPromise()
			)
			.then(() => this.dialogRef.close(true));
	}

}
