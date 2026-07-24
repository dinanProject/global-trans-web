import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { OptionItem } from 'src/app/modules/option-dialog/option-dialog.component';
import { UtilityService } from 'src/app/services/utility.service';
import { City, DetailService, District, PaymentPlan, PaymentPlanDetail, PaymentPlanTrx, Province, SalesAgent, SalesInhouse, SalesRevision, Subdistrict, Unit } from './detail.service';

@Component({
	selector: 'app-detail',
	templateUrl: './detail.component.html',
	styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {

	isInitialized: boolean = false;

	salesRevisionId: number;

	formGroup: FormGroup;
	fullName: FormControl<string>;
	genderId: FormControl<number>;
	dob: FormControl<Date>;
	pob: FormControl<string>;
	religionId: FormControl<number>;
	maritalStatusId: FormControl<number>;
	email: FormControl<string>;
	homePhone: FormControl<string>;
	mobilePhone: FormControl<string>;
	identityCode: FormControl<string>;
	npwp: FormControl<string>;
	identityAddress: FormControl<string>;
	identitySubdistrictId: FormControl<number>;
	mailingAddress: FormControl<string>;
	mailingSubdistrictId: FormControl<number>;
	occupationId: FormControl<number>;
	customerCompanyName: FormControl<string>;
	customerCompanyAddress: FormControl<string>;
	customerCompanyPhone: FormControl<string>;
	customerCompanyFax: FormControl<string>;

	salesDate: FormControl<Date>;
	unit: FormControl<Unit>;

	paymentPlanCode: FormControl<string>;
	unitPrice: FormControl<number>;
	discountPercent: FormControl<number>;
	discountAmount: FormControl<number>;
	salesPrice: FormControl<number>;

	akadDate: FormControl<Date>;

	salesPropertyTypeId: FormControl<number>;
	salesInhouse: FormControl<SalesInhouse>;
	salesAgent: FormControl<SalesAgent>;

	purposeOfPurchase: FormControl<OptionItem>;
	sourceOfFund: FormControl<OptionItem>;
	reference: FormControl<OptionItem>;
	promo: FormControl<string>;
	notes: FormControl<string>;

	identityProvinceId: number;
	identityCityId: number;
	identityDistrictId: number;
	mailingProvinceId: number;
	mailingCityId: number;
	mailingDistrictId: number;

	supervisorName: string;
	smName: string;

	genders: OptionItem[] = [];
	religions: OptionItem[] = [];
	maritalStatuses: OptionItem[] = [];
	provinces: Province[] = [];
	cities: City[] = [];
	districts: District[] = [];
	subdistricts: Subdistrict[] = [];
	occupations: OptionItem[] = [];
	paymentPlans: PaymentPlan[] = [];
	paymentPlanDetails: PaymentPlanDetail[] = [];
	salesPropertyTypes: OptionItem[] = [];
	purposeOfPurchases: OptionItem[] = [];
	sourceOfFunds: OptionItem[] = [];
	references: OptionItem[] = [];

	lastDate: Date;
	totalPriceAmount: number = 0;
	totalPricePercent: number = 0;

	identityImagePath: any;
	uploadedIdentity: any;

	npwpImagePath: any;
	uploadedNpwp: any;

	proofOfTransferImagePath: any;
	uploadedProofOfTransfer: any;

	ngModelOptions = { standalone: true };
	errorMessage: string;

	savedPaymentPlanCode: string;
	savedPaymentPlanDetails: PaymentPlanDetail[] = [];

	formSubmitAttempt: boolean = false;

	constructor(
		private activatedRoute: ActivatedRoute,
		private formBuilder: FormBuilder,
		private detailService: DetailService,
		private utilityService: UtilityService
	) { }

	ngOnInit(): void {
		this.salesRevisionId = +this.activatedRoute.snapshot.paramMap.get('salesRevisionId');

		this.fullName = new FormControl(null, [Validators.required]);
		this.genderId = new FormControl(null, [Validators.required]);
		this.dob = new FormControl(null, [Validators.required]);
		this.pob = new FormControl(null);
		this.religionId = new FormControl(null, [Validators.required]);
		this.maritalStatusId = new FormControl(null, [Validators.required]);
		this.email = new FormControl(null, [Validators.required]);
		this.homePhone = new FormControl(null);
		this.mobilePhone = new FormControl(null, [Validators.required]);
		this.identityCode = new FormControl(null, [Validators.required]);
		this.npwp = new FormControl(null, [Validators.required]);
		this.identityAddress = new FormControl(null, [Validators.required]);
		this.identitySubdistrictId = new FormControl(null, [Validators.required]);
		this.mailingAddress = new FormControl(null, [Validators.required]);
		this.mailingSubdistrictId = new FormControl(null, [Validators.required]);
		this.occupationId = new FormControl(null, [Validators.required]);
		this.customerCompanyName = new FormControl(null);
		this.customerCompanyAddress = new FormControl(null);
		this.customerCompanyPhone = new FormControl(null);
		this.customerCompanyFax = new FormControl(null);

		this.salesDate = new FormControl(null, [Validators.required]);
		this.unit = new FormControl(null, [Validators.required]);
		this.paymentPlanCode = new FormControl(null, [Validators.required]);
		this.unitPrice = new FormControl(null, [Validators.required, Validators.min(1)]);
		this.discountPercent = new FormControl(null);
		this.discountAmount = new FormControl(null);
		this.salesPrice = new FormControl(null, [Validators.required, Validators.min(1)]);
		this.akadDate = new FormControl(null);
		this.salesPropertyTypeId = new FormControl(null);
		this.salesInhouse = new FormControl(null, [Validators.required]);
		this.salesAgent = new FormControl(null, [Validators.required]);

		this.purposeOfPurchase = new FormControl(null, [Validators.required]);
		this.sourceOfFund = new FormControl(null, [Validators.required]);
		this.reference = new FormControl(null, [Validators.required]);
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
			customerCompanyName: this.customerCompanyName,
			customerCompanyAddress: this.customerCompanyAddress,
			customerCompanyPhone: this.customerCompanyPhone,
			customerCompanyFax: this.customerCompanyFax,
			salesDate: this.salesDate,
			unit: this.unit,
			paymentPlanCode: this.paymentPlanCode,
			unitPrice: this.unitPrice,
			discountPercent: this.discountPercent,
			discountAmount: this.discountAmount,
			salesPrice: this.salesPrice,
			akadDate: this.akadDate,
			salesPropertyTypeId: this.salesPropertyTypeId,
			salesInhouse: this.salesInhouse,
			salesAgent: this.salesAgent,
			purposeOfPurchase: this.purposeOfPurchase,
			sourceOfFund: this.sourceOfFund,
			reference: this.reference,
			promo: this.promo,
			notes: this.notes
		})

		this.getGenders()
			.then(() => this.getReligions())
			.then(() => this.getMaritalStatuses())
			.then(() => this.getProvinces())
			.then(() => this.getCities())
			.then(() => this.getDistricts())
			.then(() => this.getSubdistricts())
			.then(() => this.getSalesRevision())
			.then(() => this.getOccupations())
			.then(() => this.getSalesPropertyTypes())
			.then(() => this.getUnitPaymentPlans())
			.then(() => this.getUnitPaymentPlanDetails())
			.then(() => this.getSalesRevisionPaymentPlan())
			.then(() => this.getSalesRevisionPaymentPlanDetails())
			.then(() => this.generatePaymentPlanTrxs())
			.then(() => this.getSavedPaymentPlanDetails())
			.then(() => this.isInitialized = true);
	}

	getSalesRevision() {
		return this.detailService.getSalesRevision(this.salesRevisionId)
			.toPromise()
			.then((r: SalesRevision) => {
				console.log('r', r);
				this.formGroup.setValue({
					fullName: r.fullName,
					genderId: r.genderId,
					dob: r.dob,
					pob: r.pob,
					religionId: r.religionId,
					maritalStatusId: r.maritalStatusId,
					email: r.email,
					homePhone: r.homePhone,
					mobilePhone: r.mobilePhone,
					identityCode: r.identityCode,
					npwp: r.npwp,
					identityAddress: r.identityAddress,
					identitySubdistrictId: r.identitySubdistrictId,
					mailingAddress: r.mailingAddress,
					mailingSubdistrictId: r.mailingSubdistrictId,
					occupationId: r.occupationId,
					customerCompanyName: r.customerCompanyName,
					customerCompanyAddress: r.customerCompanyAddress,
					customerCompanyPhone: r.customerCompanyPhone,
					customerCompanyFax: r.customerCompanyFax,
					salesDate: r.salesDate,
					unit: {
						unitId: r.unitId,
						unitName: r.unitName,
						unitTypeName: r.unitTypeName,
						projectName: r.projectName,
					},
					paymentPlanCode: r.paymentPlanCode,
					unitPrice: r.unitPrice,
					discountPercent: r.discountPercent,
					discountAmount: r.discountAmount,
					salesPrice: r.salesPrice,
					akadDate: r.akadDate,

					salesPropertyTypeId: r.salesPropertyTypeId,
					salesInhouse: {
						salesInhouseId: r.salesInhouseId,
						fullName: r.salesInhouseName,
						supervisorName: r.salesInhouseSupervisorName,
						smName: r.salesInhouseManagerName,
					},
					salesAgent: {
						salesAgentId: r.salesAgentId,
						fullName: r.salesAgentName,
						propertyAgentName: r.propertyAgentName
					},
					purposeOfPurchase: {
						optionId: r.purposeOfPurchaseId,
						optionName: r.purposeOfPurchaseName,
					},
					sourceOfFund: {
						optionId: r.sourceOfFundId,
						optionName: r.sourceOfFundName,
					},
					reference: {
						optionId: r.referenceId,
						optionName: r.referenceName,
					},
					promo: r.promo,
					notes: r.notes
				})

				console.log('formGroup', this.formGroup.value);

				const identitySubdistrict = this.subdistricts.find((s: Subdistrict) => +s.subdistrictId === +r.identitySubdistrictId);
				const identityDistrict = this.districts.find((d: District) => +d.districtId === +identitySubdistrict?.districtId);
				const identityCity = this.cities.find((c: City) => +c.cityId === +identityDistrict?.cityId);
				const identityProvince = this.provinces.find((p: Province) => +p.provinceId === +identityCity?.provinceId);

				this.identityDistrictId = identityDistrict?.districtId;
				this.identityCityId = identityCity?.cityId;
				this.identityProvinceId = identityProvince?.provinceId;

				const mailingSubdistrict = this.subdistricts.find((s: Subdistrict) => +s.subdistrictId === +r.mailingSubdistrictId);
				const mailingDistrict = this.districts.find((d: District) => +d.districtId === +mailingSubdistrict?.districtId);
				const mailingCity = this.cities.find((c: City) => +c.cityId === +mailingDistrict?.cityId);
				const mailingProvince = this.provinces.find((p: Province) => +p.provinceId === +mailingCity?.provinceId);

				this.mailingDistrictId = mailingDistrict?.districtId;
				this.mailingCityId = mailingCity?.cityId;
				this.mailingProvinceId = mailingProvince?.provinceId;

				this.salesPrice.valueChanges.subscribe((value: number) => {
					const unitPrice = this.unitPrice.value;
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

				this.supervisorName = r.salesInhouseSupervisorName;
				this.smName = r.salesInhouseManagerName;

				this.identityImagePath = r.identityImagePath;
				this.npwpImagePath = r.npwpImagePath;
				this.proofOfTransferImagePath = r.proofOfTransferImagePath;

				this.savedPaymentPlanCode = r.paymentPlanCode;
			});
	}

	getGenders() {
		return this.detailService.getGenders()
			.toPromise()
			.then((genders: OptionItem[]) => {
				this.genders = genders;
			})
	}

	getReligions() {
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

	getProvinces() {
		return this.detailService.getProvinces()
			.toPromise()
			.then((provinces: Province[]) => {
				this.provinces = provinces;
			})
	}

	get identityProvinceName() {
		return this.provinces.find((p: Province) => +p.provinceId === +this.identityProvinceId)?.provinceName;
	}

	get mailingProvinceName() {
		return this.provinces.find((p: Province) => +p.provinceId === +this.mailingProvinceId)?.provinceName;
	}

	identityProvinceChanged(e) {
		this.identityCityId = 0;
		this.identityDistrictId = 0;
		this.identitySubdistrictId.setValue(0);
	}

	mailingProvinceChanged(e) {
		this.mailingCityId = 0;
		this.mailingDistrictId = 0;
		this.mailingSubdistrictId.setValue(0);
	}

	getCities() {
		return this.detailService.getCities()
			.toPromise()
			.then((cities: City[]) => {
				this.cities = cities;
			})
	}

	get identityCityName() {
		return this.cities.find((c: City) => +c.cityId === +this.identityCityId)?.cityName;
	}

	get mailingCityName() {
		return this.cities.find((c: City) => +c.cityId === +this.mailingCityId)?.cityName;
	}

	identityCityChanged(e) {
		this.identityDistrictId = 0;
		this.identitySubdistrictId.setValue(0);
	}

	mailingCityChanged(e) {
		this.mailingDistrictId = 0;
		this.mailingSubdistrictId.setValue(0);
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

	get identityDistrictName() {
		return this.districts.find((d: District) => +d.districtId === +this.identityDistrictId)?.districtName;
	}

	get mailingDistrictName() {
		return this.districts.find((d: District) => +d.districtId === +this.mailingDistrictId)?.districtName;
	}

	identityDistrictChanged(e) {
		this.identitySubdistrictId.setValue(0);
	}

	mailingDistrictChanged(e) {
		this.mailingSubdistrictId.setValue(0);
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

	get identitySubdistrictName() {
		return this.subdistricts.find((s: Subdistrict) => +s.subdistrictId === +this.identitySubdistrictId.value)?.subdistrictName;
	}

	get mailingSubdistrictName() {
		return this.subdistricts.find((s: Subdistrict) => +s.subdistrictId === +this.mailingSubdistrictId.value)?.subdistrictName;
	}

	getFilteredSubdistricts(districtId: number) {
		return this.subdistricts.filter((s: Subdistrict) => +s.districtId === +districtId);
	}

	getOccupations() {
		return this.detailService.getOccupations()
			.toPromise()
			.then((occupations: OptionItem[]) => {
				this.occupations = occupations;
			})
	}

	copyFromIdentityAddress() {
		this.mailingAddress.setValue(this.identityAddress.value);
		this.mailingProvinceId = this.identityProvinceId;
		this.mailingCityId = this.identityCityId;
		this.mailingDistrictId = this.identityDistrictId;
		this.mailingSubdistrictId.setValue(this.identitySubdistrictId.value);
	}

	getUnits() {
		return this.detailService.getUnits();
	}

	getUnitPaymentPlans() {
		return this.detailService.getUnitPaymentPlans(this.unit.value.unitId)
			.toPromise()
			.then((pps: PaymentPlan[]) => {
				this.paymentPlans = pps;
			})
	}

	getUnitPaymentPlanDetails() {
		return this.detailService.getUnitPaymentPlanDetails(this.unit.value.unitId)
			.toPromise()
			.then((ppds: PaymentPlanDetail[]) => {
				console.log('unit ppds', ppds);
				this.paymentPlanDetails = ppds;
			})
	}

	getSalesRevisionPaymentPlan() {
		return this.detailService.getSalesRevisionPaymentPlan(this.salesRevisionId)
			.toPromise()
			.then((pp: PaymentPlan) => {
				this.paymentPlans.push(pp);
			})
	}

	getSalesRevisionPaymentPlanDetails() {
		return this.detailService.getSalesRevisionPaymentPlanDetails(this.salesRevisionId)
			.toPromise()
			.then((ppds: PaymentPlanDetail[]) => {
				console.log('getSalesRevisionPaymentPlanDetails', JSON.parse(JSON.stringify(ppds)));
				this.paymentPlanDetails.push(...ppds);
			})
	}

	get selectedPaymentPlan() {
		return this.paymentPlans.find((p: PaymentPlan) => p.paymentPlanCode === this.paymentPlanCode.value);
	}

	get selectedPaymentPlanDetails(): PaymentPlanDetail[] {
		return this.paymentPlanDetails
			.filter((ppd: PaymentPlanDetail) =>
				ppd.paymentPlanCode === this.paymentPlanCode.value
			);
	}

	paymentPlanChanged() {
		const pp = this.selectedPaymentPlan;
		console.log('pp', pp);
		this.discountPercent.setValue(0);
		this.discountAmount.setValue(0);
		this.unitPrice.setValue(pp.price);
		this.salesPrice.setValue(pp.price);
		// this.generatePaymentPlanTrxs();
		console.log('this.paymentPlanDetails', this.paymentPlanDetails);
	}

	get isKPR() {
		return this.selectedPaymentPlan?.paymentMethodName === 'KPR';
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
			console.log('ppd ==>', ppd);
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
					} else {
						if (+ppd.pricePercent > 0) {
							ppd.updatedPricePercent -= this.calculateDeductionPercent(ppd);
						}
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
		this.totalPricePercent = (totalPriceAmount / price) * 100;

		if (this.isInitialized) {
			this.formGroup.markAsDirty();
		}
	}

	getSavedPaymentPlanDetails() {
		this.savedPaymentPlanDetails = Array.prototype.concat.apply([], JSON.parse(JSON.stringify(this.selectedPaymentPlanDetails.map((ppd: PaymentPlanDetail) => ppd.paymentPlanTrxs))));
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
			const ppds: PaymentPlanDetail[] = this.paymentPlanDetails.filter((ppd: PaymentPlanDetail) => ppd.paymentPlanCode === this.paymentPlanCode.value);
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
			const ppds: PaymentPlanDetail[] = this.paymentPlanDetails.filter((ppd: PaymentPlanDetail) => ppd.paymentPlanCode === this.paymentPlanCode.value);
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
		if (+value === 0) {
			ppd.interval = 0;
			ppd.priceAmount = 0;
			ppd.pricePercent = 0;
		}
		this.generatePaymentPlanTrxs();
	}

	headerIntervalChanged(ppd: PaymentPlanDetail, value: number) {
		ppd.interval = value;
		ppd.paymentPlanTrxs = [];
		if (+value === 0) {
			ppd.numberOfInstall = 0;
			ppd.priceAmount = 0;
			ppd.pricePercent = 0;
		}
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

	getSalesPropertyTypes() {
		return this.detailService.getSalesPropertyTypes()
			.toPromise()
			.then((salesPropertyTypes: OptionItem[]) => {
				this.salesPropertyTypes = salesPropertyTypes;
			})
	}

	getSalesInhouses() {
		return this.detailService.getSalesInhouses();
	}

	salesInhouseSelected(e) {
		console.log(e);
	}

	getSalesAgents() {
		return this.detailService.getSalesAgents();
	}

	salesAgentSelected(e) {
		console.log(e);
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
		// this.purposeOfPurchase = o;
		// this.purposeOfPurchaseId.setValue(o.optionId);
		// if (this.isInitialized) {
		// 	this.purposeOfPurchaseId.markAsDirty();
		// }
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
		// if (this.isInitialized) {
		// 	this.sourceOfFundId.markAsDirty();
		// }
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
		// if (this.isInitialized) {
		// 	this.referenceId.markAsDirty();
		// }
	}

	convertImageToBase64(file) {
		// console.log(file);
		return new Promise((resolve) => {
			const fileReader: FileReader = new FileReader();
			fileReader.onloadend = () => {
				resolve(fileReader.result.toString());
			};
			fileReader.onerror = (e) => console.error(e);
			fileReader.readAsDataURL(file);
		});
	}

	uploadIdentityChanged(e) {
		const file: File = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];
		if (file) {
			this.convertImageToBase64(file)
				.then((base64Image) => {
					e.target.value = '';
					this.formGroup.markAsDirty();
					this.uploadedIdentity = base64Image;
				});
		}
	}

	uploadNpwpChanged(e) {
		const file: File = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];
		if (file) {
			this.convertImageToBase64(file)
				.then((base64Image) => {
					e.target.value = '';
					this.formGroup.markAsDirty();
					this.uploadedNpwp = base64Image;
				});
		}
	}

	uploadProofOfTransferChanged(e) {
		const file: File = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];
		if (file) {
			this.convertImageToBase64(file)
				.then((base64Image) => {
					e.target.value = '';
					this.formGroup.markAsDirty();
					this.uploadedProofOfTransfer = base64Image;
				});
		}
	}

	dataURItoBlob(dataURI) {
		const binary = atob(dataURI.split(',')[1]);
		const array = [];
		for (let i = 0; i < binary.length; i++) {
			array.push(binary.charCodeAt(i));
		}

		return new Blob([new Uint8Array(array)], {
			type: 'image/jpeg'
		});
	}

	get isPaymentPlanCodeChanged(): boolean {
		return this.paymentPlanCode.value !== this.savedPaymentPlanCode;
	}

	get isPaymentPlanTrxChanged(): boolean {
		const paymentPlanTrxs: PaymentPlanTrx[] = Array.prototype.concat.apply([], this.selectedPaymentPlanDetails.map((ppd: PaymentPlanDetail) => ppd.paymentPlanTrxs));
		return paymentPlanTrxs.some((trx: PaymentPlanTrx, i: number) => {
			const trx2: PaymentPlanTrx = this.savedPaymentPlanDetails[i];
			return (+trx.updatedPriceAmount !== +trx2.updatedPriceAmount) ||
				(trx.updatedDescription !== trx2.updatedDescription) ||
				(new Date(trx.updatedPaymentDate).getTime() !== new Date(trx2.updatedPaymentDate).getTime());
		});
	}

	findInvalidControls() {
		const invalid = [];
		const controls = this.formGroup.controls;
		for (const name in controls) {
			if (controls[name].invalid) {
				invalid.push(name);
			}
		}
		return invalid;
	}

	submit() {
		this.formSubmitAttempt = true;
		this.errorMessage = '';
		console.log('isDirty', this.formGroup.dirty);
		console.log('isPaymentPlanCodeChanged', this.isPaymentPlanCodeChanged);
		console.log('isPaymentPlanTrxChanged', this.isPaymentPlanTrxChanged);

		if (this.formGroup.invalid) {
			this.errorMessage = 'Please fill in all required fields';
			console.log(this.findInvalidControls());
			return;
		}

		const data = this.formGroup.value;
		data.genderName = this.genders.find((o: OptionItem) => +o.optionId === +data.genderId).optionName;
		data.religionName = this.religions.find((o: OptionItem) => +o.optionId === +data.religionId).optionName;
		data.maritalStatusName = this.maritalStatuses.find((o: OptionItem) => +o.optionId === +data.maritalStatusId).optionName;
		data.occupationName = this.occupations.find((o: OptionItem) => +o.optionId === +data.occupationId).optionName;

		data.identityProvinceName = this.identityProvinceName;
		data.identityProvinceId = this.identityProvinceId;
		data.mailingProvinceName = this.mailingProvinceName;
		data.mailingProvinceId = this.mailingProvinceId;

		data.identityCityName = this.identityCityName;
		data.identityCityId = this.identityCityId;
		data.mailingCityName = this.mailingCityName;
		data.mailingCityId = this.mailingCityId;

		data.identityDistrictName = this.identityDistrictName;
		data.identityDistrictId = this.identityDistrictId;
		data.mailingDistrictName = this.mailingDistrictName;
		data.mailingDistrictId = this.mailingDistrictId;

		data.identitySubdistrictName = this.identitySubdistrictName;
		data.mailingSubdistrictName = this.mailingSubdistrictName;

		data.isPaymentPlanCodeChanged = this.isPaymentPlanCodeChanged;
		data.isPaymentPlanTrxChanged = this.isPaymentPlanTrxChanged;
		data.dob = formatDate(data.dob, 'yyyy-MM-dd', 'en');
		data.salesDate = formatDate(data.salesDate, 'yyyy-MM-dd', 'en');
		data.akadDate = data.akadDate ? formatDate(data.akadDate, 'yyyy-MM-dd', 'en') : null;

		data.paymentMethodId = this.selectedPaymentPlan.paymentMethodId;
		data.paymentMethodName = this.selectedPaymentPlan.paymentMethodName;
		data.paymentPlanName = this.selectedPaymentPlan.paymentPlanName;

		const paymentPlanDetails = JSON.stringify(
			this.selectedPaymentPlanDetails
				.map((ppd: PaymentPlanDetail) => ({
					paymentSchemeId: ppd.paymentSchemeId,
					priceAmount: ppd.updatedPriceAmount || this.getPriceAmount(ppd.updatedPricePercent),
					pricePercent: this.roundPercent(ppd.updatedPricePercent || this.getPricePercent(ppd.updatedPriceAmount)),
					sequence: ppd.sequence,
					numberOfInstall: ppd.numberOfInstall,
					interval: ppd.interval,
					intervalTypeId: ppd.intervalTypeId,
					intervalFromId: ppd.intervalFromId,
					deductFromId: ppd.deductFromId,
					deductAmount: ppd.deductAmount,
					deductPercent: ppd.deductPercent,
					paymentPlanTrxs: ppd.paymentPlanTrxs.map((t: PaymentPlanTrx) => ({
						sequence: t.sequence,
						paymentDate: formatDate(t.updatedPaymentDate, 'yyyy-MM-dd', 'en'),
						description: t.updatedDescription,
						pricePercent: this.roundPercent(t.updatedPricePercent || this.getPricePercent(t.updatedPriceAmount)),
						priceAmount: t.updatedPriceAmount || this.getPriceAmount(t.updatedPricePercent)
					}))
				})));

		data.paymentPlanDetails = paymentPlanDetails;

		const formData = new FormData();
		formData.append('data', JSON.stringify(data));

		if (this.uploadedIdentity) {
			formData.append('identity', this.dataURItoBlob(this.uploadedIdentity), 'identity.jpg');
		}

		if (this.uploadedNpwp) {
			formData.append('npwp', this.dataURItoBlob(this.uploadedNpwp), 'npwp.jpg');
		}

		if (this.uploadedProofOfTransfer) {
			formData.append('proofOfTransfer', this.dataURItoBlob(this.uploadedProofOfTransfer), 'proof-of-transfer.jpg');
		}

		this.detailService.updateSalesRevision(this.salesRevisionId, formData)
			.subscribe((result) => {
				console.log(result);
			})
	}

}
