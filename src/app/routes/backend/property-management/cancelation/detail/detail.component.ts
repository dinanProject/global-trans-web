import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CanceledUnit } from '../cancelation.component';
import { DetailService } from './detail.service';

export interface Cancelation {
	salesCancelationId: number;
	fullName: string;
	genderName: string;
	formatedDob: string;
	pob: string;
	religionName: string;
	maritalStatusName: string;
	email: string;
	identityCode: string;
	npwp: string;
	homePhone: string;
	handPhone: string;
	identityAddress: string;
	mailingAddress: string;
	customerOccupationName: string;
	customerCompanyName: string;
	customerCompanyAddress: string;
	customerCompanyPhone: string;
	customerCompanyFax: string;
	unitId: number;
	unitName: string;
	projectId: number;
	projectName: string;
	paymentPlanName: string;
	unitPrice: number;
	discountPercent: number;
	discountAmount: number;
	salesPrice: number;
	promo: string;
	remark: string;
	agentPropertyTypeName: string;
	salesName: string;
	agentPropertyTypeId: number;
	agentPropertyName: string;
	agentPropertyLeadName: string;
	agentPropertyOfficePhone: string;
	agentPropertySalesPhone: string;
	purposeOfPurchaseName: string;
	purposeOfPurchaseRemark: string;
	sourceOfFundsName: string;
	sourceOfFundsRemark: string;
	productReferenceName: string;
	productReferenceRemark: string;
	// TODO: delete ktpImagePath
	ktpImagePath: string;
	identityImagePath: string;
	npwpImagePath: string;
	proofOfTransferImagePath: string;
	cancelationDate: string;
	cancelationUser: string;
	cancelationReason: string;
}

export interface BillingSchedule {
	paymentDate: string;
	paymentSchemeName: string;
	priceAmount: number;
}

@Component({
	selector: 'app-detail',
	templateUrl: './detail.component.html',
	styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {

	isInitialized: boolean;
	cancelationId: number;
	cancelation: Cancelation;
	billingSchedules: BillingSchedule[] = [];

	constructor(
		private activatedRoute: ActivatedRoute,
		private detailService: DetailService
	) { }

	ngOnInit(): void {
		this.cancelationId = +this.activatedRoute.snapshot.paramMap.get('salesCancelationId');
		this.getCancelation();
	}

	getCancelation() {
		this.detailService.getCancelation(this.cancelationId).subscribe((data: { cancelation: Cancelation, billingSchedules: BillingSchedule[] }) => {
			console.log('data', data);
			this.cancelation = data.cancelation;
			this.billingSchedules = data.billingSchedules;
			this.isInitialized = true;
		})
	}

	get totalPrice() {
		return this.billingSchedules.map((b: BillingSchedule) => b.priceAmount).reduce((total, num) => total + num);
	}


}
