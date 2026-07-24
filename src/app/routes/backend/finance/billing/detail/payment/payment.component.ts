import { formatDate } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Billing } from '../detail.service';
import { PaymentService } from './payment.service';

@Component({
	selector: 'app-payment',
	templateUrl: './payment.component.html',
	styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements OnInit {

	billing: Billing;

	formGroup: UntypedFormGroup;
	paymentDate: UntypedFormControl;
	paymentAmount: UntypedFormControl;
	remark: UntypedFormControl;

	formSubmitAttempt: boolean;
	isInitialized: boolean;

	constructor(
		@Inject(MAT_DIALOG_DATA) private data: { billing: Billing },
		private formBuilder: UntypedFormBuilder,
		private processService: PaymentService,
		private dialogRef: MatDialogRef<PaymentComponent>
	) { }

	ngOnInit(): void {
		this.formSubmitAttempt = false;
		this.isInitialized = false;
		console.log('this.data', this.data);
		this.billing = this.data.billing;

		this.paymentDate = new UntypedFormControl(new Date(), [Validators.required]);
		this.paymentAmount = new UntypedFormControl('', [Validators.required]);
		this.remark = new UntypedFormControl('');

		this.formGroup = this.formBuilder.group({
			paymentDate: this.paymentDate,
			paymentAmount: this.paymentAmount,
			remark: this.remark
		})

		this.isInitialized = true;
	}

	save() {
		this.formSubmitAttempt = true;
		if (this.formGroup.invalid) {
			return;
		}

		const data = this.formGroup.value;
		data.paymentDate = formatDate(data.paymentDate, 'yyyy-MM-dd', 'en');
		this.processService.payment(this.billing.billingId, data).subscribe(result => {
			this.dialogRef.close(true);
		})
	}
}
