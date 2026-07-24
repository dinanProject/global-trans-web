import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PaymentPlan, PaymentPlanData, PaymentPlanDetail } from '../reservation.service';

@Component({
	selector: 'app-edit-payment-plan',
	templateUrl: './edit-payment-plan.component.html',
	styleUrls: ['./edit-payment-plan.component.scss']
})
export class EditPaymentPlanComponent implements OnInit {

	isInitialized: boolean;
	paymentPlan: PaymentPlan;

	totalPriceAmount = 0;
	totalPricePercent = 0;

	constructor(
		@Inject(MAT_DIALOG_DATA) private data: { paymentPlan: PaymentPlan },
		private dialogRef: MatDialogRef<EditPaymentPlanComponent>
	) { }

	ngOnInit(): void {
		this.isInitialized = false;
		console.log(this.data.paymentPlan);
		this.paymentPlan = JSON.parse(JSON.stringify(this.data.paymentPlan));
		// console.log(this.paymentPlan);
		this.isInitialized = true;
		// if (+this.selectedPaymentPlan.paymentPlanId > 0) {
		this.calculatePaymentPlan();
		// }
		this.calcTotalPrice();
	}

	calculatePaymentPlan() {
		let i = 0;
		let lastPriceAmount = this.paymentPlan.price;
		let lastPricePercent = 100;
		for (const p of this.paymentPlan.paymentPlanDetails) {
			++i;
			if (i === this.paymentPlan.paymentPlanDetails.length) {
				p.priceAmount = lastPriceAmount;
				p.pricePercent = lastPricePercent;
			} else {
				if (!p.pricePercent) {
					p.pricePercent = p.priceAmount / this.paymentPlan.price * 100;
				}

				if (!p.priceAmount) {
					p.priceAmount = this.paymentPlan.price * p.pricePercent / 100;
					if (p.deductFromId) {
						p.priceAmount = p.priceAmount - p.deductAmount;
						p.pricePercent = p.pricePercent - ((p.deductAmount / this.paymentPlan.price) * 100);
					}
				}

				lastPriceAmount -= p.priceAmount;
				lastPricePercent -= p.pricePercent;
			}
			p.paymentPlanDatas = this.generatePaymentPlanDatas(p);
		}
	}

	generatePaymentPlanDatas(p: PaymentPlanDetail) {
		// this.paymentDate = new Date();

		// GET LAST PREVIOUS PAYMENT DATE
		const paymentDate = new Date();
		for (const ppd of this.paymentPlan.paymentPlanDetails) {
			if (+ppd.paymentPlanDetailId === +p.paymentPlanDetailId) {
				break;
			}
			for (let i = 0; i < ppd.numberOfInstall; i++) {
				paymentDate.setDate(paymentDate.getDate() + +ppd.interval);
			};
		}

		const paymentPlanDatas: PaymentPlanData[] = [];
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

			const paymentPlanData: PaymentPlanData = {
				no: null,
				paymentDate: new Date(paymentDate),
				paymentSchemeId: p.paymentSchemeId,
				paymentSchemeName: p.paymentPlanDatas[i]?.paymentSchemeName || paymentSchemeName,
				priceAmount: ceiledPriceAmount,
				pricePercent: ceiledPricePercent
			};

			paymentPlanDatas.push(paymentPlanData)

			paymentDate.setDate(paymentDate.getDate() + +p.interval);
		}
		return paymentPlanDatas;
	}

	headerCountChanged(p: PaymentPlanDetail) {
		this.calculatePaymentPlan();
	}

	headerIntvChanged(p: PaymentPlanDetail) {
		this.calculatePaymentPlan();
	}

	headerAmountChanged(p: PaymentPlanDetail, e) {
		p.priceAmount = +e.replace(/\./g, '');
		p.pricePercent = null;

		this.calculatePaymentPlan();
	}

	headerPercentChanged(p: PaymentPlanDetail, e) {
		p.priceAmount = null;
		p.pricePercent = +e.replace(/\./g, '');

		this.calculatePaymentPlan();
	}

	detailAmountChanged(p: PaymentPlanDetail, d: PaymentPlanData, i: number, e) {
		d.priceAmount = +e.replace(/\./g, '');
		d.pricePercent = d.priceAmount / this.paymentPlan.price * 100;

		let j = 0;
		let lastPriceAmount = p.priceAmount;
		let remainingDatasCount = p.paymentPlanDatas.length;
		for (const ppd of p.paymentPlanDatas) {
			if (j > i) {
				ppd.priceAmount = lastPriceAmount / remainingDatasCount;
				ppd.pricePercent = ppd.priceAmount / this.paymentPlan.price * 100;
			} else {
				lastPriceAmount -= ppd.priceAmount;
				remainingDatasCount--;
			}
			j++;
		}
	}

	detailPercentChanged(p: PaymentPlanDetail, d: PaymentPlanData, i: number, e) {
		d.pricePercent = +e.replace(/\./g, '');
		d.priceAmount = this.paymentPlan.price * d.pricePercent / 100;

		let j = 0;
		let lastPricePercent = p.pricePercent;
		let remainingDatasCount = p.paymentPlanDatas.length;
		for (const ppd of p.paymentPlanDatas) {
			if (j > i) {
				ppd.pricePercent = lastPricePercent / remainingDatasCount;
				ppd.priceAmount = this.paymentPlan.price * ppd.pricePercent / 100;
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
		for (const p of this.paymentPlan.paymentPlanDetails) {
			for (const d of p.paymentPlanDatas) {
				totalPriceAmount += d.priceAmount;
			}
		}
		this.totalPriceAmount = totalPriceAmount;
	}

	calcTotalPricePercent() {
		let totalPricePercent = 0;
		for (const p of this.paymentPlan.paymentPlanDetails) {
			for (const d of p.paymentPlanDatas) {
				totalPricePercent += d.pricePercent;
			}
		}

		this.totalPricePercent = totalPricePercent;
	}

	save() {
		this.dialogRef.close(this.paymentPlan);
	}
}
