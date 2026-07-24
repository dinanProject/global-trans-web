import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Billing, DetailService, Sales } from './detail.service';
import { PaymentComponent } from './payment/payment.component';

@Component({
	selector: 'app-detail',
	templateUrl: './detail.component.html',
	styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {

	isInitialized: boolean;
	salesId: number;

	sales: Sales;
	billings: Billing[];
	isPaymentProcessing: boolean;
	isDownloadExcelProcessing: boolean;
	isDownloadPdfProcessing: boolean;

	constructor(
		private activatedRoute: ActivatedRoute,
		private detailService: DetailService,
		private dialog: MatDialog
	) { }

	ngOnInit(): void {
		this.isInitialized = false;
		this.salesId = +this.activatedRoute.snapshot.paramMap.get('salesId');
		this.getSales();
	}

	getSales() {
		this.detailService.getSales(this.salesId).subscribe((result: { sales: Sales, billings: Billing[] }) => {
			console.log('result', result);
			this.sales = result.sales;
			this.billings = result.billings;
			this.isInitialized = true;
		})
	}

	get totalPrice() {
		// return this.billingSchedules.map((b: Billings) => b.priceAmount).reduce((total, num) => total + num);
		// return this.billings.map((b: Billing) => b.billingAmount).reduce((total, num) => total + num);
		return this.sales.salesPrice;
	}

	get totalPriceExcludePpn() {
		return this.totalPrice / 1.1;
	}

	get ppn() {
		return this.totalPrice - this.totalPriceExcludePpn;
	}

	get totalPaid() {
		// return this.billingSchedules.map((b: Billings) => b.priceAmount).reduce((total, num) => total + num);
		// return this.billings.map((b: Billing) => b.paymentAmount).reduce((total, num) => total + num);
		return this.sales.paidAmount;
	}

	get totalOutstanding() {
		// return this.billingSchedules.map((b: Billings) => b.priceAmount).reduce((total, num) => total + num);
		// return this.billings.map((b: Billing) => b.billingAmount - b.paymentAmount).reduce((total, num) => total + num);
		return this.totalPrice - this.totalPaid;
	}

	get outstandingBilling() {
		return this.billings.find((b: Billing) => b.billingId === this.sales.currentBillingId);
	}

	processPayment() {
		console.log('this.sales', this.sales);
		console.log('this.billings', this.billings);
		console.log('this.outstandingBilling', this.outstandingBilling);
		this.isPaymentProcessing = true;
		this.dialog
			.open(PaymentComponent, {
				width: '400px',
				data: {
					billing: this.outstandingBilling
				}
			})
			.afterClosed()
			.subscribe(result => {
				this.isPaymentProcessing = false;
				this.getSales();
				// this.detailService.processHandover(this.salesId, { handoverDate }).subscribe(result => {
				// 	this.isPaymentProcessing = false;
				// 	this.getSales();
				// })
			})
	}

	downloadExcel() {
		this.isDownloadExcelProcessing = true;
		this.detailService.downloadExcel(this.salesId).subscribe(result => {
			console.log(result);
			this.isDownloadExcelProcessing = false;
			window.open(result);
		})
	}

	downloadPdf() {
		this.isDownloadPdfProcessing = true;
		this.detailService.downloadPdf(this.salesId).subscribe(result => {
			console.log(result);
			this.isDownloadPdfProcessing = false;
			window.open(result);
		}, (err) => {
			console.log(err);
			this.isDownloadPdfProcessing = false;
		})
	}
}
