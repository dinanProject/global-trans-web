import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PaymentPlan, PaymentPlanData, PaymentPlanDetail } from '../reservation.service';

export interface PaymentScheme {
	paymentSchemeId: number;
	paymentSchemeName: string;
}

@Component({
	selector: 'app-custom-plan',
	templateUrl: './custom-plan.component.html',
	styleUrls: ['./custom-plan.component.scss']
})
export class CustomPlanComponent implements OnInit {

	unitId: number;
	paymentPlans: Array<PaymentPlan>;
	selectedPaymentPlan: PaymentPlan;

	isInitialized: boolean;

	selectedPaymentPlanDetailId: number;
	no = 0;

	totalPriceAmount = 0;
	totalPricePercent = 0;

	constructor(
		@Inject(MAT_DIALOG_DATA) private data: { selectedPaymentPlanId: number, paymentPlans: Array<PaymentPlan> },
		private dialogRef: MatDialogRef<CustomPlanComponent>
	) { }

	ngOnInit(): void {
		this.isInitialized = false;
		this.paymentPlans = JSON.parse(JSON.stringify(this.data.paymentPlans));
		console.log(this.paymentPlans);
		this.selectedPaymentPlan = this.paymentPlans.find((p: PaymentPlan) => +p.paymentPlanId === +this.data.selectedPaymentPlanId);
		this.isInitialized = true;
		if (+this.selectedPaymentPlan.paymentPlanId > 0) {
			this.calcPaymentPlan();
		}
		this.calcTotalPrice();
	}

	paymentPlanChanged(value) {
		this.selectedPaymentPlan = this.paymentPlans.find((p: PaymentPlan) => +p.paymentPlanId === +value);
		this.calcPaymentPlan();
		this.calcTotalPrice();
	}

	calcPaymentPlan() {
		let i = 0;
		const priceAmount = this.selectedPaymentPlan.price;
		console.log('priceAmount', priceAmount);
		let lastPriceAmount = priceAmount;
		let lastPricePercent = 100;
		for (const p of this.selectedPaymentPlan.paymentPlanDetails) {
			++i;
			if (i === this.selectedPaymentPlan.paymentPlanDetails.length) {
				p.priceAmount = lastPriceAmount;
				p.pricePercent = lastPricePercent;
			} else {
				console.log('aaaa', p.priceAmount);
				if (!p.pricePercent) {
					p.pricePercent = p.priceAmount / this.selectedPaymentPlan.price * 100;
				}

				if (!p.priceAmount) {
					p.priceAmount = this.selectedPaymentPlan.price * p.pricePercent / 100;
					if (p.deductFromId) {
						p.priceAmount = p.priceAmount - p.deductAmount;
						p.pricePercent = p.pricePercent - ((p.deductAmount / this.selectedPaymentPlan.price) * 100);
					}
				}

				lastPriceAmount -= p.priceAmount;
				lastPricePercent -= p.pricePercent;
			}
			p.paymentPlanDatas = this.getPaymentPlanDatas(p);
		}
	}

	getPaymentPlanDatas(p: PaymentPlanDetail) {
		// this.paymentDate = new Date();

		// GET LAST PREVIOUS PAYMENT DATE
		const paymentDate = new Date();
		for (const ppd of this.selectedPaymentPlan.paymentPlanDetails) {
			if (+ppd.paymentPlanDetailId === +p.paymentPlanDetailId) {
				break;
			}
			for (let i = 0; i < ppd.numberOfInstall; i++) {
				paymentDate.setDate(paymentDate.getDate() + +ppd.interval);
				console.log('paymentDate 2b', paymentDate)
			};
		}

		const paymentPlanDatas: Array<PaymentPlanData> = [];
		console.log('bbbb', p.priceAmount);
		let priceAmount = p.priceAmount / p.numberOfInstall;
		let ceiledPriceAmount = Math.ceil(priceAmount / 1000) * 1000;
		let lastPriceAmount = p.priceAmount;

		let pricePercent = p.pricePercent / p.numberOfInstall;
		let ceiledPricePercent = Math.ceil(pricePercent * 100) / 100;
		let lastPricePercent = p.pricePercent;

		for (let i = 0; i < p.numberOfInstall; i++) {
			const paymentSchemeName = p.numberOfInstall > 1 ? `${p.paymentSchemeName} ${i + 1}` : p.paymentSchemeName;
			if (i === p.numberOfInstall - 1) {
				ceiledPriceAmount = lastPriceAmount;
				ceiledPricePercent = lastPricePercent;
			} else {
				lastPriceAmount -= ceiledPriceAmount;
				lastPricePercent -= ceiledPricePercent;
			}
			paymentPlanDatas.push({
				no: null,
				paymentDate: new Date(paymentDate),
				paymentSchemeId: p.paymentSchemeId,
				paymentSchemeName: paymentSchemeName,
				priceAmount: ceiledPriceAmount,
				pricePercent: ceiledPricePercent
			})

			paymentDate.setDate(paymentDate.getDate() + +p.interval);
		}
		return paymentPlanDatas;
	}

	headerCountChanged(p: PaymentPlanDetail) {
		// p.paymentPlanDatas = this.getPaymentPlanDatas(p);
		this.calcPaymentPlan();
	}

	headerIntvChanged(p: PaymentPlanDetail) {
		// p.paymentPlanDatas = this.getPaymentPlanDatas(p);
		this.calcPaymentPlan();
	}

	headerAmountChanged(p: PaymentPlanDetail, e) {
		console.log('e', e);
		p.priceAmount = +e.replace(/\./g, '');
		p.pricePercent = null;

		this.calcPaymentPlan();
	}

	headerPercentChanged(p: PaymentPlanDetail, e: Event) {
		const val: string = (e.target as HTMLInputElement).value;
		console.log('e', val);
		p.priceAmount = null;
		p.pricePercent = +val.replace(/\./g, '');

		this.calcPaymentPlan();
	}

	detailAmountChanged(p: PaymentPlanDetail, d: PaymentPlanData, i: number, e) {
		d.priceAmount = +e.replace(/\./g, '');
		d.pricePercent = d.priceAmount / this.selectedPaymentPlan.price * 100;

		let j = 0;
		let lastPriceAmount = p.priceAmount;
		let remainingDatasCount = p.paymentPlanDatas.length;
		for (const ppd of p.paymentPlanDatas) {
			if (j > i) {
				ppd.priceAmount = lastPriceAmount / remainingDatasCount;
				ppd.pricePercent = ppd.priceAmount / this.selectedPaymentPlan.price * 100;
			} else {
				lastPriceAmount -= ppd.priceAmount;
				remainingDatasCount--;
			}
			j++;
		}
	}

	detailPercentChanged(p: PaymentPlanDetail, d: PaymentPlanData, i: number, e) {
		d.pricePercent = +e.replace(/\./g, '');
		d.priceAmount = this.selectedPaymentPlan.price * d.pricePercent / 100;

		let j = 0;
		let lastPricePercent = p.pricePercent;
		let remainingDatasCount = p.paymentPlanDatas.length;
		for (const ppd of p.paymentPlanDatas) {
			if (j > i) {
				ppd.pricePercent = lastPricePercent / remainingDatasCount;
				ppd.priceAmount = this.selectedPaymentPlan.price * ppd.pricePercent / 100;
			} else {
				lastPricePercent -= ppd.pricePercent;
				remainingDatasCount--;
			}
			j++;
		}
	}

	calcTotalPrice() {
		this.calcTotalPriceAmount();
		this.calcTotalPricePercent();
	}

	calcTotalPriceAmount() {
		let totalPriceAmount = 0;
		for (const p of this.selectedPaymentPlan.paymentPlanDetails) {
			for (const d of p.paymentPlanDatas) {
				totalPriceAmount += d.priceAmount;
			}
		}
		this.totalPriceAmount = totalPriceAmount;
	}

	calcTotalPricePercent() {
		let totalPricePercent = 0;
		for (const p of this.selectedPaymentPlan.paymentPlanDetails) {
			for (const d of p.paymentPlanDatas) {
				totalPricePercent += d.pricePercent;
			}
		}

		this.totalPricePercent = totalPricePercent;
	}

	save() {
		const datas = [];
		let i = 0;
		const paymentPlan: PaymentPlan = Object.assign(JSON.parse(JSON.stringify(this.selectedPaymentPlan)), {
			paymentPlanId: 0,
			paymentPlanName: 'Custom'
		});

		for (const p of paymentPlan.paymentPlanDetails) {
			for (const d of p.paymentPlanDatas) {
				datas.push(Object.assign(d, { no: ++i }));
			}
		}
		console.log(paymentPlan);
		this.dialogRef.close(paymentPlan);
	}

}
