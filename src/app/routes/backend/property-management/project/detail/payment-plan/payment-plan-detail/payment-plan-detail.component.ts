import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PaymentPlanDetail } from '../payment-plan.service';
import { IntervalFrom, IntervalType, PaymentPlanDetailService, PaymentScheme } from './payment-plan-detail.service';

@Component({
	selector: 'app-payment-plan-detail',
	templateUrl: './payment-plan-detail.component.html',
	styleUrls: ['./payment-plan-detail.component.scss']
})
export class PaymentPlanDetailComponent implements OnInit {

	projectId: number;
	paymentPlanId: number;
	paymentPlanDetail: PaymentPlanDetail;

	paymentSchemes: PaymentScheme[];
	intervalTypes: IntervalType[];
	intervalFroms: IntervalFrom[];

	formGroup: UntypedFormGroup;
	paymentSchemeId: UntypedFormControl;
	priceAmount: UntypedFormControl;
	pricePercent: UntypedFormControl;
	sequence: UntypedFormControl;
	numberOfInstall: UntypedFormControl;
	interval: UntypedFormControl;
	intervalTypeId: UntypedFormControl;
	intervalFromId: UntypedFormControl;
	deductFromId: UntypedFormControl;
	deductAmount: UntypedFormControl;
	deductPercent: UntypedFormControl;

	isInitialized: boolean;

	constructor(
		@Inject(MAT_DIALOG_DATA) private data: {
			projectId: number,
			paymentPlanId: number,
			paymentPlanDetail: PaymentPlanDetail,
			intervalFroms: IntervalFrom[]
		},
		private paymentPlanDetailService: PaymentPlanDetailService,
		private formBuilder: UntypedFormBuilder,
		private dialogRef: MatDialogRef<PaymentPlanDetailComponent>
	) { }

	ngOnInit(): void {
		console.log('data', this.data);
		this.isInitialized = false;
		this.projectId = this.data.projectId;
		this.paymentPlanId = this.data.paymentPlanId;
		// this.paymentPlanDetailId = this.data.paymentPlanDetailId;
		this.paymentPlanDetail = this.data.paymentPlanDetail;
		this.intervalFroms = this.data.intervalFroms;
		this.initForm();
		this.getPaymentSchemes()
			.then(() => this.getIntervalTypes())
			// .then(() => this.getPaymentPlanDetail());
			.then(() => {
				if (this.paymentPlanDetail) {
					this.formGroup.setValue({
						paymentSchemeId: this.paymentPlanDetail.paymentSchemeId,
						priceAmount: this.paymentPlanDetail.priceAmount,
						pricePercent: this.paymentPlanDetail.pricePercent,
						sequence: this.paymentPlanDetail.sequence,
						numberOfInstall: this.paymentPlanDetail.numberOfInstall,
						interval: this.paymentPlanDetail.interval,
						intervalTypeId: this.paymentPlanDetail.intervalTypeId,
						intervalFromId: this.paymentPlanDetail.intervalFromId,
						deductFromId: this.paymentPlanDetail.deductFromId,
						deductAmount: this.paymentPlanDetail.deductAmount,
						deductPercent: this.paymentPlanDetail.deductPercent,
					});
				}

				this.isInitialized = true;
			});
	}

	initForm() {
		this.paymentSchemeId = new UntypedFormControl(1);
		this.priceAmount = new UntypedFormControl();
		this.pricePercent = new UntypedFormControl();
		this.sequence = new UntypedFormControl();
		this.numberOfInstall = new UntypedFormControl();
		this.interval = new UntypedFormControl();
		this.intervalTypeId = new UntypedFormControl();
		this.intervalFromId = new UntypedFormControl();
		this.deductFromId = new UntypedFormControl();
		this.deductAmount = new UntypedFormControl();
		this.deductPercent = new UntypedFormControl();

		this.formGroup = this.formBuilder.group({
			paymentSchemeId: this.paymentSchemeId,
			priceAmount: this.priceAmount,
			pricePercent: this.pricePercent,
			sequence: this.sequence,
			numberOfInstall: this.numberOfInstall,
			interval: this.interval,
			intervalTypeId: this.intervalTypeId,
			intervalFromId: this.intervalFromId,
			deductFromId: this.deductFromId,
			deductAmount: this.deductAmount,
			deductPercent: this.deductPercent,
		});
	}

	getPaymentSchemes() {
		return this.paymentPlanDetailService.getPaymentSchemes(this.projectId,
			this.paymentPlanId)
			.toPromise()
			.then((paymentSchemes: PaymentScheme[]) => {
				this.paymentSchemes = paymentSchemes;
			})
	}

	getIntervalTypes() {
		return this.paymentPlanDetailService.getIntervalTypes(this.projectId,
			this.paymentPlanId)
			.toPromise()
			.then((intervalTypes: IntervalType[]) => {
				this.intervalTypes = intervalTypes;
			})
	}

	get paymentSchemeName() {
		return this.paymentSchemes.find((p: PaymentScheme) => +p.paymentSchemeId === +this.paymentSchemeId.value).paymentSchemeName;
	}

	get intervalTypeName() {
		return this.intervalTypes.find((i: IntervalType) => +i.intervalTypeId === +this.intervalTypeId.value).intervalTypeName;
	}

	save() {
		this.paymentPlanDetail = Object.assign(this.paymentPlanDetail || {}, this.formGroup.value);
		this.paymentPlanDetail.paymentSchemeName = this.paymentSchemeName;
		this.paymentPlanDetail.intervalTypeName = null;
		if (this.intervalTypeId.value) {
			this.paymentPlanDetail.intervalTypeName = this.intervalTypeName;
		}
		this.dialogRef.close(this.paymentPlanDetail);
	}
}
