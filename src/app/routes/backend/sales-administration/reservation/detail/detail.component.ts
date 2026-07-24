import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { OptionItem } from 'src/app/modules/option-dialog/option-dialog.component';
import { SessionService } from 'src/app/services/session.service';
import { UtilityService } from 'src/app/services/utility.service';
import {
	City,
	DetailService,
	District,
	PaymentPlan,
	PaymentPlanDetail,
	PaymentPlanTrx,
	Province,
	Regional,
	Reservation,
	SalesAgent,
	SalesInhouse,
	Subdistrict,
	Unit
} from './detail.service';

@Component({
	selector: 'app-detail',
	templateUrl: './detail.component.html',
	styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {

	isInitialized: boolean;

	reservationId: number;
	reservation: Reservation;
	reservationStatusName: string;
	reservationStatusDate: string;
	reservationUserName: string;
	color: string;
	icon: string;

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
	companyName: FormControl<string>;
	companyAddress: FormControl<string>;
	companyPhone: FormControl<string>;
	companyFax: FormControl<string>;
	unitId: FormControl<number>;
	reservationDate: FormControl<Date>;
	paymentPlanCode: FormControl<string>;
	unitPrice: FormControl<number>;
	discountPercent: FormControl<number>;
	discountAmount: FormControl<number>;
	salesPrice: FormControl<number>;
	salesPropertyTypeId: FormControl<number>;
	salesInhouseId: FormControl<number>;
	salesAgentId: FormControl<number>;
	leadPropertyAgentId: FormControl<number>;
	purposeOfPurchaseId: FormControl<number>;
	sourceOfFundId: FormControl<number>;
	referenceId: FormControl<number>;
	promo: FormControl<string>;
	notes: FormControl<string>;

	akadDate: FormControl<Date>;
	prePaymentDate: FormControl<Date>;
	prePaymentTypeId: FormControl<number>;
	prePaymentAmount: FormControl<number>;
	prePaymentNotes: FormControl<string>;

	finalizeFormGroup: FormGroup;
	salesDate: FormControl<Date>;
	bookingFeePaymentDate: FormControl<Date>;
	bookingFeePaymentTypeId: FormControl<number>;
	bookingFeePaymentAmount: FormControl<number>;
	bookingFeePaymentNotes: FormControl<string>;

	genders: OptionItem[] = [];
	religions: OptionItem[] = [];
	maritalStatuses: OptionItem[] = [];

	regional: Regional;
	provinces: Province[] = [];
	cities: City[] = [];
	districts: District[] = [];
	subdistricts: Subdistrict[] = [];

	identityProvinceId: number = 0;
	identityCityId: number = 0;
	identityDistrictId: number = 0;

	unit: Unit;
	salesInhouse: SalesInhouse;
	salesAgent: SalesAgent;

	mailingProvinceId: number = 0;
	mailingCityId: number = 0;
	mailingDistrictId: number = 0;

	occupations: OptionItem[] = [];
	salesPropertyTypes: OptionItem[] = [];
	leadPropertyAgents: OptionItem[] = [];
	paymentTypes: OptionItem[];

	paymentPlans: PaymentPlan[] = [];
	paymentPlanDetails: PaymentPlanDetail[] = [];

	occopationName: string;

	unitName: string;
	unitTypeName: string;
	projectName: string;

	salesName: string;
	supervisorName: string;
	smName: string;
	propertyAgentName: string;

	purposeOfPurchase: OptionItem;
	sourceOfFund: OptionItem;
	reference: OptionItem;

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

	formSubmitAttempt: boolean;

	isSaving: boolean;
	isRequestingApproval: boolean;
	isApproving: boolean;
	isCanceling: boolean;
	isFinalizing: boolean;
	isRequestApprovalAttempt: boolean;
	isPreviewing: boolean;

	isFormFinalizeSubmitAttempt: boolean;

	constructor(
		private router: Router,
		private activatedRoute: ActivatedRoute,
		private formBuilder: FormBuilder,
		private detailService: DetailService,
		private utilityService: UtilityService,
		private sessionService: SessionService,
	) { }

	ngOnInit(): void {
		this.isInitialized = false;
		this.formSubmitAttempt = false;
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
		this.identitySubdistrictId = new FormControl(0, [Validators.required, Validators.min(1)]);
		this.mailingAddress = new FormControl(null, [Validators.required]);
		this.mailingSubdistrictId = new FormControl(0, [Validators.required, Validators.min(1)]);
		this.occupationId = new FormControl(0, [Validators.required, Validators.min(1)]);
		this.companyName = new FormControl(null);
		this.companyAddress = new FormControl(null);
		this.companyPhone = new FormControl(null);
		this.companyFax = new FormControl(null);
		this.unitId = new FormControl(null, [Validators.required]);
		this.reservationDate = new FormControl(new Date(), [Validators.required]);
		this.paymentPlanCode = new FormControl(null, [Validators.required]);
		this.unitPrice = new FormControl(0, [Validators.required, Validators.min(1)]);
		this.discountAmount = new FormControl(0, [Validators.required]);
		this.discountPercent = new FormControl(0, [Validators.required]);
		this.salesPrice = new FormControl(0, [Validators.required, Validators.min(1)]);
		this.salesPropertyTypeId = new FormControl(1, [Validators.required]);
		this.salesInhouseId = new FormControl(null);
		this.salesAgentId = new FormControl(null);
		this.leadPropertyAgentId = new FormControl(null);
		this.purposeOfPurchaseId = new FormControl(null, [Validators.required]);
		this.sourceOfFundId = new FormControl(null, [Validators.required]);
		this.referenceId = new FormControl(null, [Validators.required]);
		this.promo = new FormControl(null);
		this.notes = new FormControl(null);

		this.akadDate = new FormControl(null);
		this.prePaymentDate = new FormControl(new Date(), [Validators.required]);
		this.prePaymentTypeId = new FormControl(4, [Validators.required]);
		this.prePaymentAmount = new FormControl(0, [Validators.required, Validators.min(1)]);
		this.prePaymentNotes = new FormControl(null);

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
			unitId: this.unitId,
			reservationDate: this.reservationDate,
			paymentPlanCode: this.paymentPlanCode,
			unitPrice: this.unitPrice,
			discountAmount: this.discountAmount,
			discountPercent: this.discountPercent,
			salesPrice: this.salesPrice,
			salesPropertyTypeId: this.salesPropertyTypeId,
			salesInhouseId: this.salesInhouseId,
			salesAgentId: this.salesAgentId,
			leadPropertyAgentId: this.leadPropertyAgentId,
			purposeOfPurchaseId: this.purposeOfPurchaseId,
			sourceOfFundId: this.sourceOfFundId,
			referenceId: this.referenceId,
			promo: this.promo,
			notes: this.notes,
			akadDate: this.akadDate,
			prePaymentDate: this.prePaymentDate,
			prePaymentTypeId: this.prePaymentTypeId,
			prePaymentAmount: this.prePaymentAmount,
			prePaymentNotes: this.prePaymentNotes,
		})

		this.salesDate = new FormControl(new Date(), [Validators.required]);
		this.bookingFeePaymentDate = new FormControl(new Date());
		this.bookingFeePaymentTypeId = new FormControl(4);
		this.bookingFeePaymentAmount = new FormControl(0, [Validators.required]);
		this.bookingFeePaymentNotes = new FormControl(null);

		this.finalizeFormGroup = this.formBuilder.group({
			salesDate: this.salesDate,
			bookingFeePaymentDate: this.bookingFeePaymentDate,
			bookingFeePaymentTypeId: this.bookingFeePaymentTypeId,
			bookingFeePaymentAmount: this.bookingFeePaymentAmount,
			bookingFeePaymentNotes: this.bookingFeePaymentNotes,
		})

		/* this.paymentPlanId.valueChanges.subscribe((value: number) => {
			if (this.paymentPlans.length > 0) {
				const pp = this.paymentPlans.find((p: PaymentPlan) => +p.paymentPlanId === +value);
				console.log('pp', pp);
				this.discountPercent.setValue(0);
				this.discountAmount.setValue(0);
				this.unitPrice.setValue(pp.price);
				if (this.salesPrice.invalid) {
					this.salesPrice.setValue(pp.price);
				}
				this.generatePaymentPlanTrxs();
			}
		}); */

		this.salesPrice.valueChanges.subscribe((value: number) => {
			// console.log('this.salesPrice.valueChanges', value);
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

		this.getGenders()
			.then(() => this.getReligions())
			.then(() => this.getMaritalStatuses())
			.then(() => this.getProvinces())
			.then(() => this.getCities())
			.then(() => this.getDistricts())
			.then(() => this.getSubdistricts())
			.then(() => this.getOccupations())
			.then(() => this.getSalesPropertyTypes())
			.then(() => this.getPaymentTypes())
			.then(() => {
				const reservationId = this.activatedRoute.snapshot.paramMap.get('reservationId');
				if (reservationId !== 'new') {
					this.reservationId = +reservationId;
					this.getReservation()
						.then(() => this.getUnit(this.reservation.unitId))
						.then(() => this.getUnitPaymentPlans())
						.then(() => this.getUnitPaymentPlanDetails())
						.then(() => this.getReservationPaymentPlan())
						.then(() => this.getReservationPaymentPlanDetails())
						.then(() => this.getUnitLeadPropertyAgents())
						.then(() => this.loadReservation())
						.then(() => this.isInitialized = true);
				} else {
					this.getUnitLeadPropertyAgents()
						.then(() => this.isInitialized = true);
				}
			});

	}

	get isReadOnly() {
		return (this.reservationStatusName === 'Approval'
			&& this.sessionService.hasMn(['web.backend.property-management.reservation.approval'])) ||
			this.isSaving ||
			this.isRequestingApproval ||
			this.isApproving ||
			this.isCanceling;
	}

	getGenders() {
		return this.detailService.getGenders()
			.toPromise()
			.then((genders: OptionItem[]) => {
				this.genders = genders;
			})
	}

	getOptionName(optionItems: OptionItem[], optionId: number) {
		return optionItems.find((o: OptionItem) => +o.optionId === +optionId).optionName;
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

	getRegionals() {
		return this.detailService.getRegionals();
	}

	regionalChanged(regional: Regional) {
		// console.log(regional);
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

	copyFromIdentityAddress() {
		this.mailingAddress.setValue(this.identityAddress.value);
		this.mailingProvinceId = this.identityProvinceId;
		this.mailingCityId = this.identityCityId;
		this.mailingDistrictId = this.identityDistrictId;
		this.mailingSubdistrictId.setValue(this.identitySubdistrictId.value);
	}

	getOccupations() {
		return this.detailService.getOccupations()
			.toPromise()
			.then((occupations: OptionItem[]) => {
				this.occupations = occupations;
			})
	}

	getReservation() {
		return this.detailService.getReservation(this.reservationId)
			.toPromise()
			.then((r: Reservation) => {
				console.log('reservation', r);
				this.reservation = r;
				this.reservationStatusName = r.reservationStatusName;
				this.reservationStatusDate = r.reservationStatusDate;
				this.reservationUserName = r.reservationUserName;
				this.color = r.color;
				this.icon = r.icon;
				this.unitId.setValue(r.unitId);
			})
	}

	loadReservation() {
		const r = this.reservation;

		if (+r.salesPropertyTypeId === 1) {
			this.salesInhouse = {
				salesInhouseId: r.salesInhouseId,
				employeeCode: r.salesInhouseEmployeeCode,
				fullName: r.salesInhouseFullName,
				salesInhouseTypeName: r.salesInhouseTypeName,
				smName: r.smName,
				supervisorName: r.supervisorName
			}
			this.salesInhouseSelected(this.salesInhouse);
		} else {
			this.salesAgent = {
				salesAgentId: r.salesAgentId,
				fullName: r.salesAgentFullName,
				propertyAgentName: r.propertyAgentName,
				salesAgentCode: r.salesAgentCode
			}
			this.salesAgentSelected(this.salesAgent);
		}

		this.purposeOfPurchase = {
			optionId: r.purposeOfPurchaseId,
			optionName: r.purposeOfPurchaseName
		}

		this.sourceOfFund = {
			optionId: r.sourceOfFundId,
			optionName: r.sourceOfFundName
		}

		this.reference = {
			optionId: r.referenceId,
			optionName: r.referenceName
		}

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
			companyName: r.companyName,
			companyAddress: r.companyAddress,
			companyPhone: r.companyPhone,
			companyFax: r.companyFax,
			unitId: r.unitId,
			reservationDate: r.reservationDate,
			paymentPlanCode: r.paymentPlanCode,
			unitPrice: r.unitPrice,
			discountAmount: r.discountAmount,
			discountPercent: r.discountPercent,
			salesPrice: r.salesPrice,
			salesPropertyTypeId: r.salesPropertyTypeId || 1,
			salesInhouseId: r.salesInhouseId,
			salesAgentId: r.salesAgentId,
			leadPropertyAgentId: r.leadPropertyAgentId,
			purposeOfPurchaseId: r.purposeOfPurchaseId,
			sourceOfFundId: r.sourceOfFundId,
			referenceId: r.referenceId,
			promo: r.promo,
			notes: r.notes,
			akadDate: r.akadDate,
			prePaymentDate: r.prePaymentDate,
			prePaymentTypeId: r.prePaymentTypeId,
			prePaymentAmount: r.prePaymentAmount,
			prePaymentNotes: r.prePaymentNotes
		});

		// console.log('this.selectedPaymentPlanDetails ===> ', this.selectedPaymentPlanDetails);

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

		this.identityImagePath = r.identityImagePath;
		this.npwpImagePath = r.npwpImagePath;
		this.proofOfTransferImagePath = r.proofOfTransferImagePath;
	}

	getReservationPaymentPlan() {
		return this.detailService.getReservationPaymentPlan(this.reservationId)
			.toPromise()
			.then((pp: PaymentPlan) => {
				// console.log('getReservationPaymentPlan', pp);
				this.paymentPlans.push(pp);
			})
	}

	getReservationPaymentPlanDetails() {
		return this.detailService.getReservationPaymentPlanDetails(this.reservationId)
			.toPromise()
			.then((ppds: PaymentPlanDetail[]) => {
				console.log('ppds', JSON.parse(JSON.stringify(ppds)));
				this.paymentPlanDetails.push(...ppds);
			})
	}

	getUnit(unitId) {
		return this.detailService.getUnit(unitId)
			.toPromise()
			.then((unit: Unit) => {
				this.unit = unit;
				this.unitName = unit.unitName;
				this.projectName = unit.projectName;
				this.unitTypeName = unit.unitTypeName;
			})
	}

	getUnits() {
		return this.detailService.getUnits();
	}

	get isUnitSelected(): boolean {
		return !!this.unitId.value;
	}

	unitSelected(u: Unit) {
		if (this.isReadOnly) {
			return;
		}
		// console.log('u', u);

		this.unitId.setValue(u.unitId);
		this.unitName = u.unitName;
		this.projectName = u.projectName;
		this.unitTypeName = u.unitTypeName;
		this.getUnitPaymentPlans()
			.then(() => this.getUnitPaymentPlanDetails())
			.then(() => this.getUnitLeadPropertyAgents())
			.then(() => {
				const pp = this.paymentPlans[0];
				console.log('pp', pp);
				this.paymentPlanCode.setValue(pp.paymentPlanCode);
				this.discountPercent.setValue(0);
				this.discountAmount.setValue(0);
				this.unitPrice.setValue(pp.price);
				this.salesPrice.setValue(pp.price);
				return;
			})
			.then(() => this.generatePaymentPlanTrxs())
	}

	getUnitPaymentPlans() {
		return this.detailService.getUnitPaymentPlans(this.unitId.value)
			.toPromise()
			.then((pps: PaymentPlan[]) => {
				// console.log('getUnitPaymentPlans', pps);
				this.paymentPlans = pps;
			})
	}

	getPaymentPlanName(paymentPlanCode: string) {
		return this.paymentPlans.find((p: PaymentPlan) => p.paymentPlanCode === paymentPlanCode).paymentPlanName;
	}

	get selectedPaymentPlan() {
		// console.log('this.paymentPlans', this.paymentPlans);
		// console.log('this.paymentPlanCode.value', this.paymentPlanCode.value);
		return this.paymentPlans.find((p: PaymentPlan) => p.paymentPlanCode === this.paymentPlanCode.value);
	}

	get prePaymentTypeName() {
		if (!this.reservationId) {
			return null;
		}

		return this.paymentTypes.find((p: OptionItem) => +p.optionId === +this.prePaymentTypeId.value).optionName;
	}

	get isKPR() {
		return this.selectedPaymentPlan?.paymentMethodName === 'KPR';
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

	getUnitPaymentPlanDetails() {
		return this.detailService.getUnitPaymentPlanDetails(this.unitId.value)
			.toPromise()
			.then((ppds: PaymentPlanDetail[]) => {
				// console.log('unit ppds', ppds);
				this.paymentPlanDetails = ppds;
			})
	}

	get selectedPaymentPlanDetails(): PaymentPlanDetail[] {
		return this.paymentPlanDetails
			.filter((ppd: PaymentPlanDetail) =>
				ppd.paymentPlanCode === this.paymentPlanCode.value
			);
	}

	get billingStartDate(): Date {
		return this.selectedPaymentPlanDetails[0].paymentPlanTrxs[0].updatedPaymentDate;
	}

	roundPercent(value) {
		return Math.round(value * 100) / 100;
	}

	generatePaymentPlanTrxs() {
		const ppds = this.selectedPaymentPlanDetails;
		// console.log('ppds', ppds);
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
			// console.log('ppd', ppd);
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

	salesPropertyTypeChanged(e) {
		// console.log('salesPropertyTypeChanged', e)
	}

	selectOccupation() {
		this.utilityService
			.optionDialog(
				'Occupation',
				'Occupation',
				this.occupations
			)
			.then((o: OptionItem) => {
				// console.log('o', o);
				if (o) {
					this.occupationId.setValue(o.optionId);
					this.occopationName = o.optionName;
				}
			})
	}

	getSalesInhouses() {
		return this.detailService.getSalesInhouses();
	}

	salesInhouseSelected(salesInhouse: SalesInhouse) {
		// console.log(salesInhouse, salesInhouse);
		this.salesName = salesInhouse.fullName;
		this.supervisorName = salesInhouse.supervisorName;
		this.smName = salesInhouse.smName;
		this.salesInhouseId.setValue(salesInhouse.salesInhouseId);
		this.salesAgentId.setValue(null);
		this.leadPropertyAgentId.setValue(null);

		if (this.isInitialized) {
			this.salesInhouseId.markAsDirty();
		}
	}

	getSalesAgents() {
		return this.detailService.getSalesAgents();
	}

	salesAgentSelected(salesAgent: SalesAgent) {
		this.salesName = salesAgent.fullName;
		this.propertyAgentName = salesAgent.propertyAgentName;
		this.salesAgentId.setValue(salesAgent.salesAgentId);
		if (this.isInitialized) {
			this.salesAgentId.markAsDirty();
		}
	}

	getUnitLeadPropertyAgents() {
		// console.log('this.unitId.value', this.unitId.value);
		return this.detailService.getUnitLeadPropertyAgents(this.unitId.value)
			.toPromise()
			.then((leadPropertyAgents: OptionItem[]) => {
				// console.log('leadPropertyAgents', leadPropertyAgents);
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
		this.purposeOfPurchase = o;
		this.purposeOfPurchaseId.setValue(o.optionId);
		if (this.isInitialized) {
			this.purposeOfPurchaseId.markAsDirty();
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
		this.sourceOfFund = o;
		this.sourceOfFundId.setValue(o.optionId);
		if (this.isInitialized) {
			this.sourceOfFundId.markAsDirty();
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
		this.reference = o;
		this.referenceId.setValue(o.optionId);
		if (this.isInitialized) {
			this.referenceId.markAsDirty();
		}
	}

	getPaymentTypes() {
		return this.detailService.getPaymentTypes()
			.toPromise()
			.then((paymentTypes: OptionItem[]) => {
				this.paymentTypes = paymentTypes;
			})
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

	get isNeedToSave() {
		return this.formGroup.dirty;
	}

	get isDocumentComplete() {
		return !!this.proofOfTransferImagePath &&
			!!this.identityImagePath &&
			!!this.npwpImagePath;
	}

	getFormValidationErrors() {
		Object.keys(this.formGroup.controls).forEach(key => {
			const controlErrors: ValidationErrors = this.formGroup.get(key).errors;
			if (controlErrors != null) {
				Object.keys(controlErrors).forEach(keyError => {
					// console.log('Key control: ' + key + ', keyError: ' + keyError + ', err value: ', controlErrors[keyError]);
				});
			}
		});
	}

	submit() {
		this.formSubmitAttempt = true;
		this.isSaving = true;
		this.errorMessage = null;
		if (this.formGroup.invalid) {
			this.getFormValidationErrors();
			this.isSaving = false;
			this.errorMessage = 'Please make sure all required field are filled correctly';
			return;
		}

		const data = this.formGroup.value;
		console.log('data', data);
		data.dob = formatDate(data.dob, 'yyyy-MM-dd', 'en');
		data.reservationDate = formatDate(data.reservationDate, 'yyyy-MM-dd', 'en');
		data.akadDate = data.akadDate ? formatDate(data.akadDate, 'yyyy-MM-dd', 'en') : null;
		data.prePaymentDate = formatDate(data.prePaymentDate, 'yyyy-MM-dd', 'en');
		data.salesName = this.salesName;

		// const selectedPaymentPlan = this.paymentPlans.find((p: PaymentPlan) => +p.paymentPlanId === +this.paymentPlanId.value);
		// data.paymentMethodName = selectedPaymentPlan.paymentMethodName;
		data.paymentMethodId = this.selectedPaymentPlan.paymentMethodId;
		data.paymentMethodName = this.selectedPaymentPlan.paymentMethodName;
		data.paymentPlanName = this.selectedPaymentPlan.paymentPlanName;

		// console.log('this.selectedPaymentPlanDetails', this.selectedPaymentPlanDetails);
		const selectedPaymentPlanDetails = JSON.parse(JSON.stringify(this.selectedPaymentPlanDetails));
		const paymentPlanDetails = JSON.stringify(
			selectedPaymentPlanDetails
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
		for (const [key, value] of Object.entries(data)) {
			formData.append(key, value === null ? '' : value?.toString());
		}

		if (this.uploadedIdentity) {
			formData.append('identity', this.dataURItoBlob(this.uploadedIdentity), 'identity.jpg');
		}

		if (this.uploadedNpwp) {
			formData.append('npwp', this.dataURItoBlob(this.uploadedNpwp), 'npwp.jpg');
		}

		if (this.uploadedProofOfTransfer) {
			formData.append('proofOfTransfer', this.dataURItoBlob(this.uploadedProofOfTransfer), 'proof-of-transfer.jpg');
		}

		if (this.reservationId) {
			this.detailService.updateReservation(this.reservationId, formData)
				.subscribe(result => {
					// console.log(result);
					this.isSaving = false;
					this.ngOnInit();
				}, err => {
					console.error(err);
					this.isSaving = false;
				})
		} else {
			this.detailService.insertReservation(formData)
				.subscribe(result => {
					// console.log(result);
					this.isSaving = false;
					this.router
						.navigate([`../${result}`], {
							relativeTo: this.activatedRoute
						})
						.then(() => this.ngOnInit());
				}, err => {
					console.error(err);
					this.isSaving = false;
				})
		}

	}

	requestApproval() {
		this.isRequestApprovalAttempt = true;
		if (!this.isDocumentComplete) {
			this.errorMessage = 'You need to upload Identity, NPWP and Proof of Transfer before you can request for approval';
			return;
		}

		this.isRequestingApproval = true;
		this.detailService.requestApproval(this.reservationId)
			.subscribe((result) => {
				this.isRequestingApproval = false;
				// console.log(result);
				this.ngOnInit();
			}, err => {
				this.isRequestingApproval = false;
			})
	}

	approve() {
		this.isApproving = true;
		this.detailService.approve(this.reservationId)
			.subscribe((result) => {
				this.isApproving = false;
				// console.log(result);
				this.ngOnInit();
			}, err => {
				this.isApproving = false;
			})
	}

	get isReadyToFinalize() {
		return this.reservationStatusName === 'Approved';
	}

	get outstandingAmount(): number {
		if (!this.isReadyToFinalize) {
			return 0;
		}
		return this.selectedPaymentPlanDetails[0].updatedPriceAmount - this.prePaymentAmount.value;
	}

	get isBookingFeePaymentEqual(): boolean {
		return +this.outstandingAmount === +this.bookingFeePaymentAmount.value;
	}

	finalize() {
		this.isFormFinalizeSubmitAttempt = true;
		this.isFinalizing = true;
		if (!this.isBookingFeePaymentEqual) {
			this.errorMessage = 'Payment Amount must equal to Outstanding Amount';
			this.isFinalizing = false;
			return;
		}

		this.salesDate.setErrors(null);
		this.billingStartDate.setTime(0);
		this.salesDate.value.setTime(0);
		console.log(this.billingStartDate, this.salesDate.value);
		if (this.billingStartDate < this.salesDate.value) {
			this.salesDate.setErrors({
				biggerThanBillingStartDate: true
			});
			this.errorMessage = 'The sales date cannot be later than the first payment date';
			this.isFinalizing = false;
			return;
		}

		if (this.finalizeFormGroup.invalid) {
			this.errorMessage = 'Please fill in all required field';
			this.isFinalizing = false;
			return;
		}

		const data = this.finalizeFormGroup.value;
		data.salesDate = formatDate(data.salesDate, 'yyyy-MM-dd', 'en');
		data.bookingFeePaymentDate = formatDate(data.bookingFeePaymentDate, 'yyyy-MM-dd', 'en');
		this.detailService.finalize(this.reservationId, data)
			.subscribe((result: { salesId: number, sprFilePath: string }) => {
				window.open(result.sprFilePath);
				this.isFinalizing = false;
				this.router.navigateByUrl(`/backend/sales-administration/sales-transaction/${result.salesId}`);
			}, err => {
				// console.log(err);
				this.errorMessage = 'Error while finalizing reservation';
				this.isFinalizing = false;
			})
	}

	cancel() {
		this.isCanceling = true;
	}

	previewSpr() {
		this.isPreviewing = true;
		this.detailService.previewSpr(this.reservationId)
			.subscribe((result) => {
				// console.log('previewSpr result', result);
				window.open(result);
				this.isPreviewing = false;
			}, (err) => {
				// console.log(err);
				this.errorMessage = 'Error while generating SPR Preview';
				this.isPreviewing = false;
			});
	}

}
