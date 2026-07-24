import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PaymentPlan, PaymentPlanData, PaymentPlanDetail } from '../detail.service';
import { CustomPlanService } from './custom-plan.service';

@Component({
	selector: 'app-custom-plan',
	templateUrl: './custom-plan.component.html',
	styleUrls: ['./custom-plan.component.scss']
})
export class CustomPlanComponent implements OnInit {

	unitId: number;
	// paymentPlans: Array<PaymentPlan>;
	reservationPaymentPlan: PaymentPlan;

	isInitialized: boolean;

	salesPrice: number;
	selectedPaymentPlanDetailId: number;
	no = 0;

	totalPriceAmount = 0;
	totalPricePercent = 0;
	paymentDate: Date;

	constructor(
		@Inject(MAT_DIALOG_DATA) private data: {
			salesPrice: number,
			reservationPaymentPlan: PaymentPlan
		},
		private customPlanService: CustomPlanService,
		private dialogRef: MatDialogRef<CustomPlanComponent>
	) { }

	ngOnInit(): void {
		this.isInitialized = false;
		// this.paymentPlans = JSON.parse(JSON.stringify(this.data.paymentPlans));
		// console.log('this.paymentPlans', this.paymentPlans);
		this.salesPrice = this.data.salesPrice;
		// this.reservationPaymentPlan = this.paymentPlans.find((p: PaymentPlan) => +p.paymentPlanId === +this.data.reservationPaymentPlan);
		this.reservationPaymentPlan = JSON.parse(JSON.stringify(this.data.reservationPaymentPlan));
		// if (+this.reservationPaymentPlan.paymentPlanId > 0) {
		// 	this.calcPaymentPlan();
		// }
		this.calculatePaymentDates();
		this.calcTotalPrice();
		this.isInitialized = true;
		console.log('this.paymentPlan', this.reservationPaymentPlan);
	}

	// getPaymentPlans(unitId) {
	// 	this.customPlanService.getPaymentPlans()
	// }

	paymentPlanChanged(value) {
		// this.reservationPaymentPlan = this.paymentPlans.find((p: PaymentPlan) => +p.paymentPlanId === +value);
		// this.calcPaymentPlan();
		// this.calcTotalPrice();
	}

	calculatePaymentPlan() {
		let i = 0;
		const priceAmount = this.salesPrice;
		let lastPriceAmount = priceAmount;
		let lastPricePercent = 100;
		for (const p of this.reservationPaymentPlan.paymentPlanDetails) {
			++i;
			if (i === this.reservationPaymentPlan.paymentPlanDetails.length) {
				p.priceAmount = lastPriceAmount;
				p.pricePercent = lastPricePercent;
			} else {
				if (!p.pricePercent) {
					p.pricePercent = p.priceAmount / this.salesPrice * 100;
				}

				if (!p.priceAmount) {
					p.priceAmount = this.salesPrice * p.pricePercent / 100;
					if (p.deductFromId) {
						p.priceAmount = p.priceAmount - p.deductAmount;
						p.pricePercent = p.pricePercent - ((p.deductAmount / this.salesPrice) * 100);
					}
				}

				lastPriceAmount -= p.priceAmount;
				lastPricePercent -= p.pricePercent;
			}
			p.paymentPlanDatas = this.generatePaymentPlanDatas(p);
		}
	}


	// getPaymentPlanDatas(p: PaymentPlanDetail) {
	// 	// this.paymentDate = new Date();

	// 	// GET LAST PREVIOUS PAYMENT DATE
	// 	const paymentDate = new Date();
	// 	for (const ppd of this.selectedPaymentPlan.paymentPlanDetails) {
	// 		if (+ppd.paymentPlanDetailId === +p.paymentPlanDetailId) {
	// 			break;
	// 		}
	// 		for (let i = 0; i < ppd.numberOfInstall; i++) {
	// 			paymentDate.setDate(paymentDate.getDate() + +ppd.interval);
	// 		};
	// 	}

	// 	const paymentPlanDatas: Array<PaymentPlanData> = [];
	// 	let priceAmount = p.priceAmount / p.numberOfInstall;
	// 	let ceiledPriceAmount = Math.ceil(priceAmount / 1000) * 1000;
	// 	let lastPriceAmount = p.priceAmount;

	// 	let pricePercent = p.pricePercent / p.numberOfInstall;
	// 	let ceiledPricePercent = Math.ceil(pricePercent * 100) / 100;
	// 	let lastPricePercent = p.pricePercent;

	// 	for (let i = 0; i < p.numberOfInstall; i++) {
	// 		const paymentSchemeName = p.numberOfInstall > 1 ? `${p.paymentSchemeName} ${i + 1}` : p.paymentSchemeName;
	// 		if (i === p.numberOfInstall - 1) {
	// 			ceiledPriceAmount = lastPriceAmount;
	// 			ceiledPricePercent = lastPricePercent;
	// 		} else {
	// 			lastPriceAmount -= ceiledPriceAmount;
	// 			lastPricePercent -= ceiledPricePercent;
	// 		}
	// 		paymentPlanDatas.push({
	// 			no: null,
	// 			paymentDate: new Date(paymentDate),
	// 			paymentSchemeId: p.paymentSchemeId,
	// 			paymentSchemeName: paymentSchemeName,
	// 			priceAmount: ceiledPriceAmount,
	// 			pricePercent: ceiledPricePercent
	// 		})

	// 		paymentDate.setDate(paymentDate.getDate() + +p.interval);
	// 	}
	// 	return paymentPlanDatas;
	// }

	generatePaymentPlanDatas(p: PaymentPlanDetail) {
		// this.paymentDate = new Date();

		// GET LAST PREVIOUS PAYMENT DATE
		// const paymentDate = new Date();
		// console.log('now', paymentDate);
		// console.log('p', p);
		// for (const ppd of this.selectedPaymentPlan.paymentPlanDetails) {
		// 	console.log('if', +ppd.paymentPlanDetailId, +p.paymentPlanDetailId)
		// 	if (+ppd.paymentPlanDetailId === +p.paymentPlanDetailId) {
		// 		break;
		// 	}
		// 	for (let i = 0; i < ppd.numberOfInstall; i++) {
		// 		paymentDate.setDate(paymentDate.getDate() + +ppd.interval);
		// 	};
		// }

		// console.log('lastPreviousPaymentDate', paymentDate);

		if (!this.paymentDate) {
			this.paymentDate = new Date();
		}

		const paymentPlanDatas: Array<PaymentPlanData> = [];
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
				paymentDate: new Date(this.paymentDate),
				paymentSchemeId: p.paymentSchemeId,
				paymentSchemeName: p.paymentPlanDatas[i]?.paymentSchemeName || paymentSchemeName,
				priceAmount: ceiledPriceAmount,
				pricePercent: ceiledPricePercent
			})

			this.paymentDate.setDate(this.paymentDate.getDate() + +p.interval);
		}
		return paymentPlanDatas;
	}

	// headerCountChanged(p: PaymentPlanDetail) {
	// 	p.paymentPlanDatas = this.getPaymentPlanDatas(p);
	// }


	headerCountChanged(p: PaymentPlanDetail) {
		// p.paymentPlanDatas = this.getPaymentPlanDatas(p);
		this.calculatePaymentPlan();
	}

	headerIntvChanged(p: PaymentPlanDetail) {
		this.paymentDate = null;
		// p.paymentPlanDatas = this.getPaymentPlanDatas(p);
		this.calculatePaymentPlan();
	}

	calculatePaymentDates() {
		if (!this.paymentDate) {
			this.paymentDate = new Date();
		}

		const p: PaymentPlan = this.reservationPaymentPlan;
		for (const pp of p.paymentPlanDetails) {
			for (const ppd of pp.paymentPlanDatas) {
				ppd.paymentDate = new Date(this.paymentDate)
				this.paymentDate.setDate(this.paymentDate.getDate() + +pp.interval);
			}
		}
	}

	headerAmountChanged(p: PaymentPlanDetail, e) {
		console.log('e', e);
		p.priceAmount = +e.replace(/\./g, '');
		p.pricePercent = null;

		this.calculatePaymentPlan();
	}

	headerPercentChanged(p: PaymentPlanDetail, e) {
		console.log('e', e);
		p.priceAmount = null;
		p.pricePercent = +e.replace(/\./g, '');

		this.calculatePaymentPlan();
	}

	detailAmountChanged(p: PaymentPlanDetail, d: PaymentPlanData, i: number, e) {
		d.priceAmount = +e.replace(/\./g, '');
		d.pricePercent = d.priceAmount / this.salesPrice * 100;

		let j = 0;
		let lastPriceAmount = p.priceAmount;
		let remainingDatasCount = p.paymentPlanDatas.length;
		let priceDiff = 0;
		for (const ppd of p.paymentPlanDatas) {
			if (j > i) {
				// ppd.priceAmount = lastPriceAmount / remainingDatasCount;
				const priceAmount = lastPriceAmount / remainingDatasCount;
				if (j < p.paymentPlanDatas.length - 1) {
					ppd.priceAmount = Math.ceil(priceAmount / 1000) * 1000;
					priceDiff += priceAmount - ppd.priceAmount;
				} else {
					ppd.priceAmount = priceAmount + priceDiff;
				}
				ppd.pricePercent = ppd.priceAmount / this.salesPrice * 100;
				console.log('ppd.pricePercent', ppd.pricePercent);
			} else {
				lastPriceAmount -= ppd.priceAmount;
				remainingDatasCount--;
			}
			j++;
		}
	}

	detailPercentChanged(p: PaymentPlanDetail, d: PaymentPlanData, i: number, e) {
		d.pricePercent = +e.replace(/\./g, '');
		d.priceAmount = this.salesPrice * d.pricePercent / 100;

		let j = 0;
		let lastPricePercent = p.pricePercent;
		let remainingDatasCount = p.paymentPlanDatas.length;
		for (const ppd of p.paymentPlanDatas) {
			if (j > i) {
				ppd.pricePercent = lastPricePercent / remainingDatasCount;
				ppd.priceAmount = this.salesPrice * ppd.pricePercent / 100;
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
		for (const p of this.reservationPaymentPlan.paymentPlanDetails) {
			for (const d of p.paymentPlanDatas) {
				totalPriceAmount += d.priceAmount;
			}
		}
		this.totalPriceAmount = totalPriceAmount;
	}

	calcTotalPricePercent() {
		let totalPricePercent = 0;
		for (const p of this.reservationPaymentPlan.paymentPlanDetails) {
			for (const d of p.paymentPlanDatas) {
				totalPricePercent += d.pricePercent;
			}
		}

		this.totalPricePercent = totalPricePercent;
	}

	save() {
		// const datas = [];
		// let i = 0;
		// const paymentPlan: PaymentPlan = Object.assign(JSON.parse(JSON.stringify(this.reservationPaymentPlan)), {
		// 	paymentPlanId: 0,
		// 	paymentPlanName: 'Custom'
		// });

		// for (const p of paymentPlan.paymentPlanDetails) {
		// 	for (const d of p.paymentPlanDatas) {
		// 		datas.push(Object.assign(d, { no: ++i }));
		// 	}
		// }
		// console.log(paymentPlan);
		this.dialogRef.close(this.reservationPaymentPlan);
	}

}
