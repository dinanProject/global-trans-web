import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { UtilityService } from 'src/app/services/utility.service';
import { CancelationComponent } from './cancelation/cancelation.component';
import { City, DetailService, District, Invoice, PaymentPlan, PaymentPlanDetail, PaymentPlanTrx, Province, SalesAgent, SalesInhouse, Subdistrict, Trx, Unit } from './detail.service';
import { OptionItem } from 'src/app/modules/option-dialog/option-dialog.component';

@Component({
	selector: 'app-detail',
	templateUrl: './detail.component.html',
	styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {

	isInitialized: boolean = false;

	formGroup: FormGroup;
	salesId: number;
	debtorId: number;
	fullName: FormControl<string>;
	genderId: FormControl<number>;
	genderName: string;
	dob: FormControl<Date>;
	formattedDob: string;
	pob: FormControl<string>;
	religionId: FormControl<number>;
	religionName: string;
	maritalStatusId: FormControl<number>;
	maritalStatusName: string;
	email: FormControl<string>;
	homePhone: FormControl<string>;
	mobilePhone: FormControl<string>;
	identityCode: FormControl<string>;
	npwp: FormControl<string>;
	identityAddress: FormControl<string>;
	identityProvinceName: string;
	identityCityName: string;
	identityDistrictName: string;
	identitySubdistrictId: FormControl<number>;
	identitySubdistrictName: string;
	mailingAddress: FormControl<string>;
	mailingProvinceName: string;
	mailingCityName: string;
	mailingDistrictName: string;
	mailingSubdistrictId: FormControl<number>;
	mailingSubdistrictName: string;
	occupationId: FormControl<number>;
	occupationName: string;
	companyName: FormControl<string>;
	companyAddress: FormControl<string>;
	companyPhone: FormControl<string>;
	companyFax: FormControl<string>;
	salesDate: FormControl<Date>;
	formattedSalesDate: string;
	unit: FormControl<Unit>;
	unitName: string;
	unitTypeName: string;
	projectName: string;
	paymentPlanId: FormControl<number>;
	paymentPlanName: string;
	paymentMethodName: string;
	unitPrice: number;
	discountPercent: FormControl<number>;
	discountAmount: FormControl<number>;
	salesPrice: FormControl<number>;
	salesPropertyTypeId: FormControl<number>;
	salesPropertyTypeName: string;
	salesInhouse: FormControl<SalesInhouse>;
	salesInhouseName: string;
	salesInhouseSupervisorName: string;
	salesInhouseManagerName: string;
	salesAgent: FormControl<SalesAgent>;
	salesAgentName: string;
	propertyAgentName: string;
	leadPropertyAgentId: FormControl<number>;
	leadPropertyAgentName: string;
	purposeOfPurchase: FormControl<OptionItem>;
	purposeOfPurchaseName: string;
	sourceOfFund: FormControl<OptionItem>;
	sourceOfFundName: string;
	reference: FormControl<OptionItem>;
	referenceName: string;
	akadDate: FormControl<Date>;
	formattedAkadDate: string;
	akadRealizationDate: FormControl<Date>;
	formattedAkadRealizationDate: string;
	promo: FormControl<string>;
	notes: FormControl<string>;
	identityImagePath: string;
	npwpImagePath: string;
	proofOfTransferImagePath: string;
	sprFilePath: string;

	formattedHandOverDate: string;
	salesRevisionId: number;
	revisionStatusId: number;
	revisionStatusName: string;
	revisionStatusDate: string;
	revisionStatusUser: string;
	formattedCancelationDate: string;
	cancelationUser: string;
	cancelationTypeId: number;
	cancelationTypeName: string;
	cancelationNotes: string;
	lastDate: Date;
	totalPriceAmount: number = 0;
	totalPricePercent: number = 0;

	invoices: Invoice[] = [];
	isAkadProcessing: boolean;
	isHandovering: boolean;
	isRevisioning: boolean;
	isApprovingRevision: boolean;
	isCanceling: boolean;

	ngModelOptions = { standalone: true };

	provinces: Province[] = [];
	cities: City[] = [];
	districts: District[] = [];
	subdistricts: Subdistrict[] = [];
	leadPropertyAgents: OptionItem[];
	genders: OptionItem[];
	religions: OptionItem[];
	maritalStatuses: OptionItem[];
	occupations: OptionItem[];
	salesPropertyTypes: OptionItem[];
	paymentTypes: OptionItem[];
	identityDistrictId: number;
	identityCityId: number;
	identityProvinceId: number;
	mailingDistrictId: number;
	mailingCityId: number;
	mailingProvinceId: number;
	paymentPlans: PaymentPlan[];
	paymentPlanDetails: PaymentPlanDetail[];
	revisionReason: string;

	constructor(
		private activatedRoute: ActivatedRoute,
		private detailService: DetailService,
		private utilityService: UtilityService,
		private dialog: MatDialog,
		private formBuilder: FormBuilder
	) { }

	ngOnInit(): void {
		this.salesId = +this.activatedRoute.snapshot.paramMap.get('salesId');
		this.fullName = new FormControl(null, [Validators.required]);
		this.genderId = new FormControl(1);
		this.dob = new FormControl(null, [Validators.required]);
		this.pob = new FormControl(null);
		this.religionId = new FormControl(1);
		this.maritalStatusId = new FormControl(1);
		this.email = new FormControl(null);
		this.homePhone = new FormControl(null);
		this.mobilePhone = new FormControl(null, [Validators.required]);
		this.identityCode = new FormControl(null, [Validators.required]);
		this.npwp = new FormControl(null, [Validators.required]);
		this.identityAddress = new FormControl(null, [Validators.required]);
		this.identitySubdistrictId = new FormControl(null, [Validators.required]);
		this.mailingAddress = new FormControl(null, [Validators.required]);
		this.mailingSubdistrictId = new FormControl(null, [Validators.required]);
		this.occupationId = new FormControl(0, [Validators.required, Validators.min(1)]);
		this.companyName = new FormControl(null);
		this.companyAddress = new FormControl(null);
		this.companyPhone = new FormControl(null);
		this.companyFax = new FormControl(null);
		this.salesDate = new FormControl(null);
		this.unit = new FormControl(null, [Validators.required]);
		this.paymentPlanId = new FormControl(0, [Validators.required]);
		this.discountPercent = new FormControl(0);
		this.discountAmount = new FormControl(0);
		this.salesPrice = new FormControl(0, [Validators.required]);
		this.salesPropertyTypeId = new FormControl(1);
		this.salesInhouse = new FormControl(null, [Validators.required]);
		this.salesAgent = new FormControl(null, [Validators.required]);
		this.leadPropertyAgentId = new FormControl(null);
		this.purposeOfPurchase = new FormControl(null, [Validators.required]);
		this.sourceOfFund = new FormControl(null, [Validators.required]);
		this.reference = new FormControl(null, [Validators.required]);
		this.akadDate = new FormControl(null);
		this.akadRealizationDate = new FormControl(null);
		this.promo = new FormControl(null);
		this.notes = new FormControl(null);

		this.formGroup = this.formBuilder.group({
			fullName: this.fullName,
			genderId: this.genderId,
			dob: this.dob,
			pob: this.pob,
			religionId: this.religionId,
			maritalStatusId: this.maritalStatusId,
			email: this.email,
			homePhone: this.homePhone,
			mobilePhone: this.mobilePhone,
			identityCode: this.identityCode,
			npwp: this.npwp,
			identityAddress: this.identityAddress,
			identitySubdistrictId: this.identitySubdistrictId,
			mailingAddress: this.mailingAddress,
			mailingSubdistrictId: this.mailingSubdistrictId,
			occupationId: this.occupationId,
			companyName: this.companyName,
			companyAddress: this.companyAddress,
			companyPhone: this.companyPhone,
			companyFax: this.companyFax,
			salesDate: this.salesDate,
			unit: this.unit,
			paymentPlanId: this.paymentPlanId,
			discountPercent: this.discountPercent,
			discountAmount: this.discountAmount,
			salesPrice: this.salesPrice,
			salesPropertyTypeId: this.salesPropertyTypeId,
			salesInhouse: this.salesInhouse,
			salesAgent: this.salesAgent,
			leadPropertyAgentId: this.leadPropertyAgentId,
			purposeOfPurchase: this.purposeOfPurchase,
			sourceOfFund: this.sourceOfFund,
			reference: this.reference,
			akadDate: this.akadDate,
			akadRealizationDate: this.akadRealizationDate,
			promo: this.promo,
			notes: this.notes,
		});

		this.getTrx()
			// .then(() => {
			// 	if (this.isRevisionApproved) {
			// 		return this.loadRevisionData()
			// 	}
			// 	return this.getTrxInvoices()
			// })
			.then(() => this.getTrxInvoices())
			.then(() => this.isInitialized = true);
	}

	loadRevisionData() {
		return this.getGenders()
			.then(() => this.getReligions())
			.then(() => this.getMaritalStatuses())
			.then(() => this.getProvinces())
			.then(() => this.getCities())
			.then(() => this.getDistricts())
			.then(() => this.getSubdistricts())
			.then(() => this.getOccupations())
			.then(() => this.getSalesPropertyTypes())
			.then(() => this.getPaymentTypes())
			.then(() => this.getUnitPaymentPlans())
			.then(() => this.getUnitPaymentPlanDetails())
			.then(() => this.getTrxPaymentPlan())
			.then(() => this.getTrxPaymentPlanDetails())
			.then(() => this.getUnitLeadPropertyAgents())
			.then(() => this.generatePaymentPlanTrxs())
			.then(() => {
				const identitySubdistrict = this.subdistricts.find((s: Subdistrict) => +s.subdistrictId === +this.identitySubdistrictId.value);
				const identityDistrict = this.districts.find((d: District) => +d.districtId === +identitySubdistrict?.districtId);
				const identityCity = this.cities.find((c: City) => +c.cityId === +identityDistrict?.cityId);
				const identityProvince = this.provinces.find((p: Province) => +p.provinceId === +identityCity?.provinceId);

				this.identityDistrictId = identityDistrict?.districtId;
				this.identityCityId = identityCity?.cityId;
				this.identityProvinceId = identityProvince?.provinceId;

				const mailingSubdistrict = this.subdistricts.find((s: Subdistrict) => +s.subdistrictId === +this.mailingSubdistrictId.value);
				const mailingDistrict = this.districts.find((d: District) => +d.districtId === +mailingSubdistrict?.districtId);
				const mailingCity = this.cities.find((c: City) => +c.cityId === +mailingDistrict?.cityId);
				const mailingProvince = this.provinces.find((p: Province) => +p.provinceId === +mailingCity?.provinceId);

				this.mailingDistrictId = mailingDistrict?.districtId;
				this.mailingCityId = mailingCity?.cityId;
				this.mailingProvinceId = mailingProvince?.provinceId;

				this.salesPrice.valueChanges.subscribe((value: number) => {
					console.log('this.salesPrice.valueChanges', value);
					const unitPrice = this.unitPrice;
					const discountAmount = unitPrice - value;
					this.discountAmount.setValue(0);
					this.discountPercent.setValue(0);
					if (discountAmount >= 0) {
						this.discountAmount.setValue(discountAmount);
						let discountPercent = (discountAmount / unitPrice);
						discountPercent = Math.round(discountPercent * 100) / 100
						this.discountPercent.setValue(discountPercent);
					}
					this.generatePaymentPlanTrxs();
				})
			})
	}

	getTrx() {
		return this.detailService.getTrx(this.salesId)
			.toPromise()
			.then((trx: Trx) => {
				console.log('trx', trx);
				this.formGroup.setValue({
					fullName: trx.fullName,
					genderId: trx.genderId,
					dob: trx.dob,
					pob: trx.pob,
					religionId: trx.religionId,
					maritalStatusId: trx.maritalStatusId,
					email: trx.email,
					homePhone: trx.homePhone,
					mobilePhone: trx.mobilePhone,
					identityCode: trx.identityCode,
					npwp: trx.npwp,
					identityAddress: trx.identityAddress,
					identitySubdistrictId: trx.identitySubdistrictId,
					mailingAddress: trx.mailingAddress,
					mailingSubdistrictId: trx.mailingSubdistrictId,
					occupationId: trx.occupationId,
					companyName: trx.companyName,
					companyAddress: trx.companyAddress,
					companyPhone: trx.companyPhone,
					companyFax: trx.companyFax,
					salesDate: trx.salesDate,
					unit: {
						unitId: trx.unitId,
						unitName: trx.unitName,
						projectName: trx.projectName,
						unitTypeName: trx.unitTypeName,
					},
					paymentPlanId: trx.paymentPlanId,
					discountPercent: trx.discountPercent,
					discountAmount: trx.discountAmount,
					salesPrice: trx.salesPrice,
					salesPropertyTypeId: trx.salesPropertyTypeId,
					salesInhouse: {
						salesInhouseId: trx.salesInhouseId,
						fullName: trx.salesInhouseName,
						supervisorName: trx.salesInhouseSupervisorName,
						smName: trx.salesInhouseManagerName,
					},
					salesAgent: {
						salesAgentId: trx.salesAgentId,
						fullName: trx.fullName,
						propertyAgentName: trx.propertyAgentName,
					},
					leadPropertyAgentId: trx.leadPropertyAgentId,
					purposeOfPurchase: {
						optionId: trx.purposeOfPurchaseId,
						optionName: trx.purposeOfPurchaseName,
					},
					sourceOfFund: {
						optionId: trx.sourceOfFundId,
						optionName: trx.sourceOfFundName,
					},
					reference: {
						optionId: trx.referenceId,
						optionName: trx.referenceName,
					},
					akadDate: trx.akadDate,
					akadRealizationDate: trx.akadRealizationDate,
					promo: trx.promo,
					notes: trx.notes,
				});

				console.log(this.formGroup.value);

				this.genderName = trx.genderName;
				this.formattedDob = trx.formattedDob;
				this.religionName = trx.religionName;
				this.maritalStatusName = trx.maritalStatusName;
				this.identityProvinceName = trx.identityProvinceName;
				this.identityCityName = trx.identityCityName;
				this.identityDistrictName = trx.identityDistrictName;
				this.identitySubdistrictName = trx.identitySubdistrictName;
				this.mailingProvinceName = trx.mailingProvinceName;
				this.mailingCityName = trx.mailingCityName;
				this.mailingDistrictName = trx.mailingDistrictName;
				this.mailingSubdistrictName = trx.mailingSubdistrictName;
				this.occupationName = trx.occupationName;
				this.formattedSalesDate = trx.formattedSalesDate;
				this.unitName = trx.unitName;
				this.unitTypeName = trx.unitTypeName;
				this.projectName = trx.projectName;
				this.paymentPlanName = trx.paymentPlanName;
				this.paymentMethodName = trx.paymentMethodName;
				this.unitPrice = trx.unitPrice;
				this.salesPropertyTypeName = trx.salesPropertyTypeName;
				this.salesInhouseName = trx.salesInhouseName;
				this.salesInhouseSupervisorName = trx.salesInhouseSupervisorName;
				this.salesInhouseManagerName = trx.salesInhouseManagerName;
				this.salesAgentName = trx.salesAgentName;
				this.propertyAgentName = trx.propertyAgentName;
				this.leadPropertyAgentName = trx.leadPropertyAgentName;
				this.purposeOfPurchaseName = trx.purposeOfPurchaseName;
				this.sourceOfFundName = trx.sourceOfFundName;
				this.referenceName = trx.referenceName;
				this.formattedAkadDate = trx.formattedAkadDate;
				this.formattedAkadRealizationDate = trx.formattedAkadRealizationDate;
				this.identityImagePath = trx.identityImagePath;
				this.npwpImagePath = trx.npwpImagePath;
				this.proofOfTransferImagePath = trx.proofOfTransferImagePath;
				this.sprFilePath = trx.sprFilePath;
				this.formattedHandOverDate = trx.formattedHandOverDate;

				this.salesRevisionId = trx.salesRevisionId;
				this.revisionStatusId = trx.revisionStatusId;
				this.revisionStatusName = trx.revisionStatusName;
				this.revisionStatusDate = trx.revisionStatusDate;
				this.revisionStatusUser = trx.revisionStatusUser;
				this.revisionReason = trx.revisionReason;
				this.formattedCancelationDate = trx.formattedCancelationDate;
				this.cancelationUser = trx.cancelationUser;
				this.cancelationTypeId = trx.cancelationTypeId;
				this.cancelationTypeName = trx.cancelationTypeName;
				this.cancelationNotes = trx.cancelationNotes;
			})
	}

	getGenders() {
		console.log('get genders');
		return this.detailService.getGenders()
			.toPromise()
			.then((genders: OptionItem[]) => {
				this.genders = genders;
			})
	}

	getReligions() {
		console.log('get religions');
		return this.detailService.getReligions()
			.toPromise()
			.then((religions: OptionItem[]) => {
				this.religions = religions;
			})
	}

	getMaritalStatuses() {
		return this.detailService.getMaritalStatuses()
			.toPromise()
			.then((maritalStatuses: OptionItem[]) => {
				this.maritalStatuses = maritalStatuses;
			})
	}

	getOccupations() {
		return this.detailService.getOccupations()
			.toPromise()
			.then((occupations: OptionItem[]) => {
				this.occupations = occupations;
			})
	}

	getSalesPropertyTypes() {
		return this.detailService.getSalesPropertyTypes()
			.toPromise()
			.then((salesPropertyTypes: OptionItem[]) => {
				this.salesPropertyTypes = salesPropertyTypes;
			})
	}

	getPaymentTypes() {
		return this.detailService.getPaymentTypes()
			.toPromise()
			.then((paymentTypes: OptionItem[]) => {
				this.paymentTypes = paymentTypes;
			})
	}

	getUnitPaymentPlans() {
		return this.detailService.getUnitPaymentPlans(this.unitId)
			.toPromise()
			.then((pps: PaymentPlan[]) => {
				this.paymentPlans = pps;
			})
	}

	getUnitPaymentPlanDetails() {
		return this.detailService.getUnitPaymentPlanDetails(this.unitId)
			.toPromise()
			.then((ppds: PaymentPlanDetail[]) => {
				this.paymentPlanDetails = ppds;
			})
	}

	getTrxPaymentPlan() {
		console.log('getTrxPaymentPlanDetails');
		return this.detailService.getTrxPaymentPlan(this.salesId)
			.toPromise()
			.then((pp: PaymentPlan) => {
				console.log('ppds', pp);
				this.paymentPlans.push(pp);
			})
	}

	getTrxPaymentPlanDetails() {
		console.log('getTrxPaymentPlanDetails');
		return this.detailService.getTrxPaymentPlanDetails(this.salesId)
			.toPromise()
			.then((ppds: PaymentPlanDetail[]) => {
				console.log('ppds', ppds);
				this.paymentPlanDetails = ppds;
			})
	}


	get selectedPaymentPlanDetails(): PaymentPlanDetail[] {
		return this.paymentPlanDetails?.filter((ppd: PaymentPlanDetail) => ppd.paymentPlanId === +this.paymentPlanId.value);
	}

	roundPercent(value) {
		return Math.round(value * 100) / 100;
	}

	generatePaymentPlanTrxs() {
		const ppds = this.selectedPaymentPlanDetails;
		const price = this.salesPrice.value;
		const isKPR = JSON.parse(JSON.stringify(this.isKPR));
		this.akadDate.setValue(null);
		let date = new Date();
		let lastTotalPriceAmount = price;
		let lastTotalPricePercent = 100;
		let sequence = 0;
		let totalPriceAmount = 0;
		let totalPricePercent = 0;
		for (const ppd of ppds) {
			console.log('ppd', ppd);
			if (ppd.paymentDate) {
				ppd.updatedPaymentDate = new Date(ppd.paymentDate);
				date = new Date(ppd.updatedPaymentDate);
			} else {
				ppd.updatedPaymentDate = new Date(date);
			}

			if (ppds.indexOf(ppd) === ppds.length - 1) {
				if (ppd.priceAmount) {
					ppd.priceAmount = lastTotalPriceAmount;
					ppd.updatedPriceAmount = ppd.priceAmount;
				}
				if (ppd.pricePercent) {
					ppd.pricePercent = lastTotalPricePercent;
					ppd.updatedPricePercent = ppd.pricePercent;
				}

				if (ppd.priceAmount) {
					totalPriceAmount += ppd.updatedPriceAmount;
					totalPricePercent += ppd.updatedPriceAmount / price * 100;
				} else {
					totalPricePercent += ppd.updatedPricePercent;
					totalPriceAmount += ppd.updatedPricePercent * price / 100;
				}
			} else {
				ppd.updatedPriceAmount = ppd.priceAmount;
				ppd.updatedPricePercent = ppd.pricePercent;
				if (ppd.deductFromId) {
					if (ppd.priceAmount) {
						// ppd.updatedPriceAmount -= this.calculateDeductionAmount(ppd);
						ppd.updatedPriceAmount = ppd.priceAmount;
					} else {
						ppd.updatedPricePercent -= this.calculateDeductionPercent(ppd);
					}

				}

				if (ppd.priceAmount) {
					lastTotalPriceAmount -= ppd.updatedPriceAmount;
					lastTotalPricePercent = lastTotalPriceAmount / price * 100;
					totalPriceAmount += ppd.updatedPriceAmount;
					totalPricePercent += ppd.updatedPriceAmount / price * 100;
				} else {
					lastTotalPricePercent -= ppd.updatedPricePercent;
					lastTotalPriceAmount = lastTotalPricePercent * price / 100;
					totalPricePercent += ppd.updatedPricePercent;
					totalPriceAmount += ppd.updatedPricePercent * price / 100;
				}

			}

			let lastDetailPriceAmount = 0;
			let lastDetailPricePercent = 0;
			if (ppd.updatedPriceAmount) {
				lastDetailPriceAmount = ppd.updatedPriceAmount;
				lastDetailPricePercent = lastDetailPriceAmount / price * 100;
			} else {
				lastDetailPriceAmount = ppd.updatedPricePercent * price / 100;
				lastDetailPricePercent = ppd.updatedPricePercent;
			}

			ppd.paymentPlanTrxs = ppd.paymentPlanTrxs || [];
			for (let n = 0; n < ppd.numberOfInstall; n++) {
				sequence++;
				let detailPriceAmount = null;
				let detailPricePercent = null;
				const trx = ppd.paymentPlanTrxs[n];
				if (trx) {
					if (trx.paymentDate) {
						trx.updatedPaymentDate = new Date(trx.paymentDate);
						date = new Date(trx.updatedPaymentDate);
					} else {
						trx.updatedPaymentDate = new Date(date);
					}

					if (trx.description) {
						trx.updatedDescription = trx.description;
					} else {
						trx.updatedDescription = ppd.numberOfInstall > 1 ? `${ppd.paymentSchemeName} ${n + 1}` : ppd.paymentSchemeName;
					}

					if (n === ppd.numberOfInstall - 1) {
						detailPriceAmount = lastDetailPriceAmount;
						detailPricePercent = lastDetailPricePercent;
					} else {
						detailPriceAmount = Math.round(lastDetailPriceAmount / (ppd.numberOfInstall - n) / 1000) * 1000;
						detailPricePercent = detailPriceAmount / price * 100;
						if (trx.priceAmount) {
							detailPriceAmount = trx.priceAmount;
							if (!trx.pricePercent) {
								detailPricePercent = detailPriceAmount / price * 100;
							}
						}
						// else {
						if (trx.pricePercent) {
							detailPricePercent = trx.pricePercent;
							if (!trx.priceAmount) {
								detailPriceAmount = detailPricePercent * price / 100;
							}
						}
						// }
					}
					Object.assign(trx, {
						updatedPriceAmount: detailPriceAmount,
						updatedPricePercent: detailPricePercent,
					});
				} else {
					if (n === ppd.numberOfInstall - 1) {
						detailPriceAmount = lastDetailPriceAmount;
						detailPricePercent = lastDetailPricePercent;
					} else {
						detailPriceAmount = Math.round(lastDetailPriceAmount / (ppd.numberOfInstall - n) / 1000) * 1000;
						detailPricePercent = detailPriceAmount / price * 100;
					}

					ppd.paymentPlanTrxs.push({
						sequence: sequence,
						updatedDescription: ppd.numberOfInstall > 1 ? `${ppd.paymentSchemeName} ${n + 1}` : ppd.paymentSchemeName,
						updatedPaymentDate: new Date(date),
						updatedPriceAmount: detailPriceAmount,
						updatedPricePercent: detailPricePercent,
						isPaid: false
					});
				}

				lastDetailPriceAmount -= detailPriceAmount;
				lastDetailPricePercent -= detailPricePercent;

				date.setDate(date.getDate() + ppd.interval);
			}

			if (isKPR && ppd.paymentSchemeCode === 'BL' /* BL = Bank Loan */) {
				this.akadDate.setValue(new Date(ppd.updatedPaymentDate));
			}
		}

		this.lastDate = new Date(date);
		this.totalPriceAmount = totalPriceAmount;
		// this.totalPricePercent = totalPricePercent;
		this.totalPricePercent = (totalPriceAmount / price) * 100;

		if (this.isInitialized) {
			this.formGroup.markAsDirty();
		}
	}

	getPriceAmount(pricePercent: number) {
		return this.salesPrice.value * pricePercent / 100;
	}

	getPricePercent(priceAmount: number) {
		return priceAmount / this.salesPrice.value * 100;
	}

	calculateDeductionAmount(ppd: PaymentPlanDetail) {
		let deductAmount = 0;
		if (ppd.deductFromId) {
			const ppds: PaymentPlanDetail[] = this.paymentPlanDetails.filter((ppd: PaymentPlanDetail) => ppd.paymentPlanId === +this.paymentPlanId.value);
			const dppd = ppds.find((p: PaymentPlanDetail) => +p.paymentSchemeId === +ppd.deductFromId);
			const price = this.salesPrice.value;
			if (dppd) {
				if (ppd.deductPercent) {
					deductAmount = dppd.priceAmount * ppd.deductPercent / 100;
				} else {
					deductAmount = ppd.deductAmount;
				}
			}
		}
		return deductAmount;
	}

	calculateDeductionPercent(ppd: PaymentPlanDetail) {
		let deductPercent = 0;
		if (ppd.deductFromId) {
			const ppds: PaymentPlanDetail[] = this.paymentPlanDetails.filter((ppd: PaymentPlanDetail) => ppd.paymentPlanId === +this.paymentPlanId.value);
			const dppd = ppds.find((p: PaymentPlanDetail) => +p.paymentSchemeId === +ppd.deductFromId);
			if (dppd) {
				if (ppd.deductPercent) {
					deductPercent = dppd.priceAmount / this.salesPrice.value * 100;
				} else {
					deductPercent = ppd.deductAmount / this.salesPrice.value * 100;
				}
			}
		}
		return deductPercent;
	}

	headerPaymentDateChanged(ppd: PaymentPlanDetail, value: Date) {
		ppd.paymentDate = new Date(value);
		this.generatePaymentPlanTrxs();
	}

	headerPaymentSchemeNameChanged(ppd: PaymentPlanDetail, value: string) {
		// console.log('ppppp');
		ppd.paymentSchemeName = value;
		this.generatePaymentPlanTrxs();
	}

	headerCountChanged(ppd: PaymentPlanDetail, value: number) {
		ppd.numberOfInstall = value;
		ppd.paymentPlanTrxs = [];
		this.generatePaymentPlanTrxs();
	}

	headerPricePercentChanged(ppd: PaymentPlanDetail, value: number) {
		ppd.priceAmount = null;
		ppd.pricePercent = value;

		// deduction di set null untuk menghindari pengurangan harga sehingga hasil akhirnya tetap sama
		if (ppd.deductFromId) {
			ppd.deductFromId = null;
		}

		this.generatePaymentPlanTrxs();
	}

	headerPriceAmountChanged(ppd: PaymentPlanDetail, value: number) {
		ppd.pricePercent = null;
		ppd.priceAmount = value;

		if (ppd.deductFromId) {
			ppd.deductFromId = null;
		}

		this.generatePaymentPlanTrxs();
	}

	detailPaymentDateChanged(trx: PaymentPlanTrx, value: Date) {
		let startNull: boolean = false;
		for (const ppd of this.selectedPaymentPlanDetails) {
			for (const t of ppd.paymentPlanTrxs) {
				if (trx === t) {
					startNull = true;
				}

				if (startNull) {
					t.paymentDate = null;
				}
			}
		}
		trx.paymentDate = new Date(value);
		this.generatePaymentPlanTrxs();
	}

	detailDescriptionChanged(trx: PaymentPlanTrx, value: string) {
		trx.description = value;
		this.generatePaymentPlanTrxs();
	}

	detailPriceAmountChanged(trx: PaymentPlanTrx, value: number) {
		trx.priceAmount = value;
		trx.pricePercent = null;
		this.generatePaymentPlanTrxs();
	}

	detailPricePercentChanged(trx: PaymentPlanTrx, value: number) {
		trx.priceAmount = null;
		trx.pricePercent = value;
		this.generatePaymentPlanTrxs();
	}

	getProvinceName(provinceId: number) {
		return this.provinces.find((p: Province) => +p.provinceId === +provinceId).provinceName;
	}

	getCityName(cityId: number) {
		return this.cities.find((c: City) => +c.cityId === +cityId).cityName;
	}

	getDistrictName(districtId: number) {
		return this.districts.find((d: District) => +d.districtId === +districtId).districtName;
	}

	getSubdistrictName(subdistrictId: number) {
		return this.subdistricts.find((s: Subdistrict) => +s.subdistrictId === +subdistrictId).subdistrictName;
	}

	getProvinces() {
		return this.detailService.getProvinces()
			.toPromise()
			.then((provinces: Province[]) => {
				this.provinces = provinces;
			})
	}

	getCities() {
		return this.detailService.getCities()
			.toPromise()
			.then((cities: City[]) => {
				this.cities = cities;
			})
	}

	getFilteredCities(provinceId: number) {
		return this.cities.filter((c: City) => +c.provinceId === +provinceId);
	}

	getDistricts() {
		return this.detailService.getDistricts()
			.toPromise()
			.then((districts: District[]) => {
				this.districts = districts;
			})
	}

	getFilteredDistricts(cityId: number) {
		return this.districts.filter((d: District) => +d.cityId === +cityId);
	}

	getSubdistricts() {
		return this.detailService.getSubdistricts()
			.toPromise()
			.then((subdistricts: Subdistrict[]) => {
				this.subdistricts = subdistricts;
			})
	}

	getFilteredSubdistricts(districtId: number) {
		return this.subdistricts.filter((s: Subdistrict) => +s.districtId === +districtId);
	}

	getUnits() {
		return this.detailService.getUnits();
	}

	unitSelected(u: Unit) {
		console.log('u', u);

		this.unit.setValue(u);
		this.unitName = u.unitName;
		this.projectName = u.projectName;
		this.unitTypeName = u.unitTypeName;
		this.getUnitPaymentPlans()
			.then(() => this.getUnitPaymentPlanDetails())
			.then(() => this.getUnitLeadPropertyAgents())
			.then(() => {
				const pp = this.paymentPlans[0];
				console.log('pp', pp);
				this.paymentPlanId.setValue(pp.paymentPlanId);
				this.discountPercent.setValue(0);
				this.discountAmount.setValue(0);
				this.unitPrice = pp.price;
				this.salesPrice.setValue(pp.price);
				return;
			})
			.then(() => this.generatePaymentPlanTrxs())
	}

	paymentPlanChanged() {
		const pp = this.selectedPaymentPlan;
		console.log('pp', pp);
		this.discountPercent.setValue(0);
		this.discountAmount.setValue(0);
		this.unitPrice = pp.price;
		this.salesPrice.setValue(pp.price);
		// this.generatePaymentPlanTrxs();
	}

	getTrxInvoices() {
		return this.detailService.getTrxInvoices(this.salesId)
			.toPromise()
			.then((invoices: Invoice[]) => {
				this.invoices = invoices;
			})
	}

	akadProcess() {
		this.isAkadProcessing = true;
		this.utilityService.singleDatePickerDialog('Akad', 'Akad Date', null, new Date())
			.then((result) => this.detailService.akadRealization(this.salesId, {
				akadRealizationDate: formatDate(result, 'yyyy-MM-dd', 'en')
			}).toPromise())
			.then(() => {
				this.isAkadProcessing = false;
				this.ngOnInit();
			});
	}

	handover() {
		this.isHandovering = true;
		this.utilityService.singleDatePickerDialog('Handover', 'Handover', null, new Date())
			.then((result) => this.detailService.handover(this.salesId, {
				handoverDate: formatDate(result, 'yyyy-MM-dd', 'en')
			}).toPromise())
			.then(() => {
				this.isHandovering = false;
				this.ngOnInit();
			});
	}

	getSalesInhouses() {
		return this.detailService.getSalesInhouses();
	}

	salesInhouseSelected(salesInhouse: SalesInhouse) {
		console.log(salesInhouse, salesInhouse);
		this.salesInhouseName = salesInhouse.fullName;
		this.salesInhouseSupervisorName = salesInhouse.supervisorName;
		this.salesInhouseManagerName = salesInhouse.smName;
		this.salesAgent.setValue(null);
		this.leadPropertyAgentId.setValue(null);

		if (this.isInitialized) {
			this.salesInhouse.markAsDirty();
		}
	}

	getSalesAgents() {
		return this.detailService.getSalesAgents();
	}

	salesAgentSelected(salesAgent: SalesAgent) {
		this.salesAgentName = salesAgent.fullName;
		this.propertyAgentName = salesAgent.propertyAgentName;
		if (this.isInitialized) {
			this.salesAgent.markAsDirty();
		}
	}

	getUnitLeadPropertyAgents() {
		console.log('this.unitId.value', this.unitId);
		return this.detailService.getUnitLeadPropertyAgents(this.unitId)
			.toPromise()
			.then((leadPropertyAgents: OptionItem[]) => {
				console.log('leadPropertyAgents', leadPropertyAgents);
				this.leadPropertyAgents = leadPropertyAgents;
			})
	}

	getPurposeOfPurchases() {
		return this.detailService.getPurposeOfPurchases()
	}

	purposeOfPurchaseAdded() {
		this.utilityService.singleInputDialog('Purpose of Purchase')
			.then((result) => {
				if (result) {
					this.detailService.insertPurposeOfPurchase(result).toPromise()
						.then((o: OptionItem) => this.purposeOfPurchaseSelected(o))
				}
			});
	}

	purposeOfPurchaseSelected(o: OptionItem) {
		// console.log('purposeOfPurchaseSelected', o);
		// this.purposeOfPurchase.setValue = o;
		if (this.isInitialized) {
			this.purposeOfPurchase.markAsDirty();
		}
	}

	getSourcesOfFund() {
		return this.detailService.getSourcesOfFund()
	}

	sourceOfFundAdded() {
		this.utilityService.singleInputDialog('Source of Fund')
			.then((result) => {
				if (result) {
					this.detailService.insertSourceOfFund(result).toPromise()
						.then((o: OptionItem) => this.sourceOfFundSelected(o))
				}
			})
	}

	sourceOfFundSelected(o: OptionItem) {
		// console.log('sourceOfFundSelected', o);
		// this.sourceOfFund = o;
		// this.sourceOfFundId.setValue(o.optionId);
		if (this.isInitialized) {
			this.sourceOfFund.markAsDirty();
		}
	}

	getReferences() {
		return this.detailService.getReferences()
	}

	referenceAdded() {
		this.utilityService.singleInputDialog('Reference')
			.then((result) => {
				if (result) {
					this.detailService.insertReference(result).toPromise()
						.then((o: OptionItem) => this.referenceSelected(o));
				}
			});
	}

	referenceSelected(o: OptionItem) {
		// this.reference = o;
		// this.referenceId.setValue(o.optionId);
		if (this.isInitialized) {
			this.reference.markAsDirty();
		}
	}

	cancelation() {
		this.isCanceling = true;
		this.dialog
			.open(CancelationComponent, {
				width: '500px',
				data: {}
			})
			.afterClosed()
			.subscribe((data) => {
				this.isCanceling = false;
				if (data) {
					console.log('cancelation result', data);
					this.detailService.cancelation(this.salesId, data)
						.subscribe((result) => {
							this.ngOnInit();
						})
				}
			})
	}

	approveCancelation() {

	}

	revision() {
		this.isRevisioning = true;
		this.utilityService.confirm('Revision', 'Do you want to request for revision?', true)
			.then((result) => {
				if (!result) {
					this.isRevisioning = false;
					return Promise.reject();
				}

				return this.detailService.revision(this.salesId, result).toPromise();
			})
			.then(() => this.isRevisioning = false)
			.then(() => this.ngOnInit())
			.catch(err => { });
	}

	approveRevision() {
		this.isApprovingRevision = true;
		this.utilityService.confirm('Revision Approval', 'Are you sure to approve this revision?')
			.then((result) => {
				if (!result) {
					this.isApprovingRevision = false;
					return Promise.reject();
				}

				return this.detailService.approveRevision(this.salesId).toPromise();
			})
			.then(() => this.isApprovingRevision = false)
			.then(() => this.ngOnInit())
			.catch(err => { });
	}

	get isRevision(): boolean {
		return (this.revisionStatusId || 4) < 4;
	}

	get isRevisionApproved(): boolean {
		return this.revisionStatusId === 2;
	}

	get isKPR(): boolean {
		return this.paymentMethodName === 'KPR';
	}

	get unitId(): number {
		return this.unit.value?.unitId;
	}

	get isAkadRealized(): boolean {
		return !!this.akadRealizationDate;
	}

	// get isHandedOver(): boolean {
	// 	return !!this.formattedHandOverDate;
	// }

	get isShowAkadProcess(): boolean {
		return this.isKPR && !this.isAkadRealized;
	}

	get isShowHandover(): boolean {
		// return (!this.isKPR && !this.formattedHandOverDate) ||
		// 	(this.isKPR && this.isAkadRealized && !this.formattedHandOverDate);
		return !this.formattedHandOverDate;
	}

	get selectedPaymentPlan() {
		return this.paymentPlans.find((p: PaymentPlan) => +p.paymentPlanId === +this.paymentPlanId.value);
	}

}
