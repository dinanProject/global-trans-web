import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PaymentPlan } from '../unit.service';

@Component({
	selector: 'app-price',
	templateUrl: './price.component.html',
	styleUrls: ['./price.component.scss']
})
export class PriceComponent implements OnInit {

	formGroup: UntypedFormGroup;
	price: UntypedFormControl;
	paymentPlanId: UntypedFormControl;
	formSubmitAttempt: boolean;

	paymentPlans: PaymentPlan[];

	constructor(
		@Inject(MAT_DIALOG_DATA) private data: any,
		private dialogRef: MatDialogRef<PriceComponent>,
		private formBuilder: UntypedFormBuilder
	) { }

	ngOnInit(): void {
		this.formSubmitAttempt = false;
		console.log('data', this.data);
		this.paymentPlans = this.data.paymentPlans;
		this.price = new UntypedFormControl(0, [Validators.required, Validators.min(1)])
		this.paymentPlanId = new UntypedFormControl(this.paymentPlans[0].paymentPlanId);
		this.formGroup = this.formBuilder.group({
			price: this.price,
			paymentPlanId: this.paymentPlanId
		});
	}

	get paymentPlanName() {
		return this.paymentPlans.find((p: PaymentPlan) => +p.paymentPlanId === +this.paymentPlanId.value).paymentPlanName;
	}

	get remark() {
		return this.paymentPlans.find((p: PaymentPlan) => +p.paymentPlanId === +this.paymentPlanId.value).remark;
	}

	submit() {
		this.formSubmitAttempt = true;
		if (this.formGroup.invalid) {
			return;
		}

		const data = this.formGroup.value;
		this.dialogRef.close({
			paymentPlanId: data.paymentPlanId,
			paymentPlanName: this.paymentPlanName,
			remark: this.remark,
			price: data.price
		});
	}
}
