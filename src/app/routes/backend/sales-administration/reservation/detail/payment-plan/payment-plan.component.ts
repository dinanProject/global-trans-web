import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PaymentPlanDetail, PaymentPlanTrx } from '../detail.service';

@Component({
	selector: 'app-payment-plan',
	templateUrl: './payment-plan.component.html',
	styleUrls: ['./payment-plan.component.scss']
})
export class PaymentPlanComponent implements OnInit {

	isInitialized: boolean;
	paymentPlanDetails: PaymentPlanDetail[];
	paymentPlanTrxs: PaymentPlanTrx[];

	constructor(
		@Inject(MAT_DIALOG_DATA) private data: {
			paymentPlanDetails: PaymentPlanDetail[],
			paymentPlanTrxs: PaymentPlanTrx[]
		},
		private dialogRef: MatDialogRef<PaymentPlanComponent>
	) { }

	ngOnInit(): void {
		console.log('paymentPlanDetails', this.data.paymentPlanDetails);
		this.paymentPlanDetails = this.data.paymentPlanDetails;
		this.paymentPlanTrxs = this.data.paymentPlanTrxs;
	}

	submit() {

	}

}
