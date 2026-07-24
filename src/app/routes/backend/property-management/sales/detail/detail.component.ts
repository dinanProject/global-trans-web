import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionService } from 'src/app/services/session.service';
import { AkadComponent } from './akad/akad.component';
import { DebtorsAccount, DetailService, Sales } from './detail.service';
import { HandoverComponent } from './handover/handover.component';
import { ReasonComponent } from './reason/reason.component';
import { RevisionComponent } from './revision/revision.component';

@Component({
	selector: 'app-detail',
	templateUrl: './detail.component.html',
	styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {

	isInitialized: boolean;

	salesId: number;
	sales: Sales;
	// billingSchedules: BillingSchedule[] = [];
	debtorsAccounts: DebtorsAccount[] = [];
	isSprPrinting: boolean;
	isCanceling: boolean;
	isAkadProcessing: boolean;
	isHandoverProcessing: boolean;
	isRevising: boolean;

	constructor(
		private activatedRoute: ActivatedRoute,
		private detailService: DetailService,
		private router: Router,
		private dialog: MatDialog,
		private sessionService: SessionService
	) { }

	ngOnInit(): void {
		this.isInitialized = false;
		this.isRevising = false;
		this.salesId = +this.activatedRoute.snapshot.paramMap.get('salesId');
		this.getSales();
	}

	getSales() {
		this.detailService.getSales(this.salesId).subscribe((data: { sales: Sales, debtorsAccounts: DebtorsAccount[] }) => {
			console.log('data', data);
			this.sales = data.sales;
			this.debtorsAccounts = data.debtorsAccounts;
			this.isInitialized = true;
		})
	}

	get totalPrice() {
		return this.debtorsAccounts.map((da: DebtorsAccount) => da.invoiceAmount).reduce((total, num) => total + num);
	}

	printSpr() {
		this.isSprPrinting = true;
		this.detailService.printSpr(this.salesId).subscribe(result => {
			console.log(result);
			window.open(result);
			this.isSprPrinting = false;
		})
	}

	cancelation() {
		// if (!confirm('Are you sure you want to cancel current sales ?')) {
		// 	return;
		// }

		this.isCanceling = true;
		this.dialog
			.open(ReasonComponent, {
				width: '400px',
				height: '328px'
			})
			.afterClosed()
			.subscribe(data => {
				if (!data) {
					this.isCanceling = false;
					return;
				}
				this.detailService.cancel(this.salesId, data).subscribe(result => {
					this.isCanceling = false;
					this.router.navigateByUrl('/backend/property-management/sales');
				})
			})

	}

	revision() {
		this.isRevising = true;
		this.dialog
			.open(RevisionComponent, {
				width: '400px',
				height: '263px'
			})
			.afterClosed()
			.subscribe(revisionReason => {
				if (!revisionReason) {
					this.isRevising = false;
					return;
				}
				this.detailService.revision(this.salesId, { revisionReason }).subscribe(result => {
					this.isRevising = false;
					this.getSales();
					// this.router.navigateByUrl('/backend/property-management/sales');
				})
			})
	}

	approveCancelation() {
		this.isCanceling = true;
		this.detailService.approveCancelation(this.salesId).subscribe(result => {
			this.isCanceling = false;
			this.router.navigateByUrl('/backend/property-management/sales');
		})
	}

	approveRevision() {
		this.isRevising = true;
		this.detailService.approveRevision(this.salesId).subscribe(result => {
			this.isRevising = false;
			this.router.navigateByUrl('/backend/property-management/sales');
		})
	}

	processAkad() {
		this.isAkadProcessing = true;
		this.dialog
			.open(AkadComponent, {
				width: '260px',
				height: '198px'
			})
			.afterClosed()
			.subscribe(akadDate => {
				if (!akadDate) {
					this.isAkadProcessing = false;
					return;
				}
				this.detailService.processAkad(this.salesId, { akadDate }).subscribe(result => {
					this.isAkadProcessing = false;
					this.router.navigateByUrl('/backend/property-management/sales');
				})
			})
	}

	processHandover() {
		this.isHandoverProcessing = true;
		this.dialog
			.open(HandoverComponent, {
				width: '260px',
				height: '198px'
			})
			.afterClosed()
			.subscribe(handoverDate => {
				if (!handoverDate) {
					this.isHandoverProcessing = false;
					return;
				}
				this.detailService.processHandover(this.salesId, { handoverDate }).subscribe(result => {
					this.isHandoverProcessing = false;
					this.router.navigateByUrl('/backend/property-management/sales');
				})
			})
	}

	get isReadOnly() {
		return this.sessionService.hasMn('web.backend.property-management.project.unit.edit-sold-and-reserved-unit');
	}
}
