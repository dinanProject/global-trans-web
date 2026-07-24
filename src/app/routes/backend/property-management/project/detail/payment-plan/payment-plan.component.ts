import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { PaymentPlanDetailComponent } from './payment-plan-detail/payment-plan-detail.component';
import { IntervalFrom } from './payment-plan-detail/payment-plan-detail.service';
import { PaymentPlanDetail, PaymentMethod, PaymentPlan, PaymentPlanService } from './payment-plan.service';

@Component({
	selector: 'app-payment-plan',
	templateUrl: './payment-plan.component.html',
	styleUrls: ['./payment-plan.component.scss']
})
export class PaymentPlanComponent implements OnInit {

	paymentPlanId: number;
	projectId: number;

	paymentMethods: PaymentMethod[];

	formGroup: UntypedFormGroup;
	paymentPlanName: UntypedFormControl;
	paymentMethodId: UntypedFormControl;
	remark: UntypedFormControl;

	paymentPlanDetails: MatTableDataSource<PaymentPlanDetail> = new MatTableDataSource();
	paymentPlanDetailsColumns = [
		'no',
		'paymentSchemeName',
		'priceAmount',
		// 'pricePercent',
		'numberOfInstall',
		'interval',
		'actions'
	];

	isInitialized: boolean;

	constructor(
		@Inject(MAT_DIALOG_DATA) private data: { paymentPlanId: number, projectId: number },
		private paymentPlanService: PaymentPlanService,
		private dialog: MatDialog,
		private dialogRef: MatDialogRef<PaymentPlanComponent>,
		private formBuilder: UntypedFormBuilder
	) { }

	ngOnInit(): void {
		this.isInitialized = false;
		this.paymentPlanId = this.data.paymentPlanId;
		this.projectId = this.data.projectId;

		this.paymentPlanName = new UntypedFormControl('', [Validators.required]);
		this.paymentMethodId = new UntypedFormControl(1);
		this.remark = new UntypedFormControl('');

		this.formGroup = this.formBuilder.group({
			paymentPlanName: this.paymentPlanName,
			paymentMethodId: this.paymentMethodId,
			remark: this.remark
		})

		this.getPaymentMethods()
			.then(() => this.getPaymentPlan());
	}

	getPaymentPlan() {
		this.paymentPlanDetails.filterPredicate = this.customFilter();
		if (!this.paymentPlanId) {
			this.isInitialized = true;
			return;
		}

		this.paymentPlanService.getPaymentPlan(this.projectId, this.paymentPlanId).subscribe((data: {
			paymentPlan: PaymentPlan,
			paymentPlanDetails: PaymentPlanDetail[]
		}) => {
			const paymentPlan: PaymentPlan = data.paymentPlan;
			this.formGroup.setValue({
				paymentPlanName: paymentPlan.paymentPlanName,
				paymentMethodId: paymentPlan.paymentMethodId,
				remark: paymentPlan.remark
			});

			this.paymentPlanDetails.data = data.paymentPlanDetails;

			this.paymentPlanDetails.filter = '1';
			this.isInitialized = true;
		});
	}

	getPaymentMethods() {
		return this.paymentPlanService.getPaymentMethods(this.projectId)
			.toPromise()
			.then((paymentMethods: PaymentMethod[]) => {
				this.paymentMethods = paymentMethods;
			});
	}

	customFilter() {
		const _filter = (data: PaymentPlanDetail, filter: string): boolean => {
			return !data.isDeleted;
		};

		return _filter;
	}

	onlyUnique(value, index, self) {
		return self.indexOf(value) === index;
	}

	addDetail() {
		const intervalFroms: IntervalFrom[] = this.paymentPlanDetails.data.map((p: PaymentPlanDetail) => ({
			intervalFromId: p.paymentSchemeId,
			intervalFromName: p.paymentSchemeName
		})).filter(this.onlyUnique);

		this.dialog
			.open(PaymentPlanDetailComponent, {
				width: '400px',
				data: {
					projectId: this.projectId,
					paymentPlanId: this.paymentPlanId,
					intervalFroms
				}
			})
			.afterClosed()
			.subscribe((result) => {
				if (!result) {
					return;
				}

				result.isAdded = true;

				const paymentPlanDetails = this.paymentPlanDetails.data;
				paymentPlanDetails.push(result);
				// Object.assign(paymentPlanDetails
				// 	.find((p: PaymentPlanDetail) => +p.paymentPlanDetailId === +paymentPlanDetail.paymentPlanDetailId), result);
				this.paymentPlanDetails.data = paymentPlanDetails;
			});
	}

	editDetail(paymentPlanDetail: PaymentPlanDetail) {
		const intervalFroms: IntervalFrom[] = this.paymentPlanDetails.data.map((p: PaymentPlanDetail) => ({
			intervalFromId: p.paymentSchemeId,
			intervalFromName: p.paymentSchemeName
		})).filter(this.onlyUnique);

		this.dialog
			.open(PaymentPlanDetailComponent, {
				width: '400px',
				data: {
					projectId: this.projectId,
					paymentPlanId: this.paymentPlanId,
					paymentPlanDetail,
					intervalFroms
				}
			})
			.afterClosed()
			.subscribe((result) => {
				if (!result) {
					return;
				}

				if (!paymentPlanDetail.isAdded) {
					result.isEdited = true;
				}
				const paymentPlanDetails = this.paymentPlanDetails.data;
				Object.assign(paymentPlanDetails
					.find((p: PaymentPlanDetail) => +p.paymentPlanDetailId === +paymentPlanDetail.paymentPlanDetailId), result);
				this.paymentPlanDetails.data = paymentPlanDetails;
			});
	}

	deleteDetail(paymentPlanDetail: PaymentPlanDetail) {
		if (!confirm('Delete current data?')) {
			return;
		}

		if (paymentPlanDetail.isAdded) {
			const ps: PaymentPlanDetail[] = this.paymentPlanDetails.data.filter((p: PaymentPlanDetail) => JSON.stringify(p) !== JSON.stringify(paymentPlanDetail));
			this.paymentPlanDetails.data = ps;
		} else {
			paymentPlanDetail.isDeleted = true;
			this.paymentPlanDetails.filter = paymentPlanDetail.paymentPlanDetailId + '';
		}
	}

	submit() {
		const data = this.formGroup.value;
		data.addedDetails = this.paymentPlanDetails.data.filter((p: PaymentPlanDetail) => p.isAdded);
		data.editedDetails = this.paymentPlanDetails.data.filter((p: PaymentPlanDetail) => p.isEdited);
		data.deletedDetails = this.paymentPlanDetails.data.filter((p: PaymentPlanDetail) => p.isDeleted);
		console.log(data);

		if (!this.paymentPlanId) {
			this.paymentPlanService.insert(this.projectId, data).subscribe(result => {
				console.log(result);
				this.dialogRef.close(true);
			})
		} else {
			this.paymentPlanService.update(this.projectId, this.paymentPlanId, data).subscribe(result => {
				console.log(result);
				this.dialogRef.close(true);
			});
		}
	}
}
