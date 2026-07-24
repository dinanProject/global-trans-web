import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { AgentPropertyType, City, DetailService, District, Gender, MaritalStatus, Occupation, PaymentPlan, ProductReference, Province, PurposeOfPurchase, Religion, Reservation, ReservationPaymentPlan, SourceOfFunds, Subdistrict } from './detail.service';
import { environment as env } from 'src/environments/environment';
import { CustomPlanComponent } from './custom-plan/custom-plan.component';
import { ChangeUnitComponent } from './change-unit/change-unit.component';
import { Unit } from './change-unit/change-unit.service';

// export interface ReservationData {
// 	currentDate: Date;
// 	genders: Gender[];
// 	religions: Religion[];
// 	occupations: Occupation[];
// 	maritalStatuses: MaritalStatus[];
// 	purposeOfPurchases: PurposeOfPurchase[];
// 	sourceOfFundses: SourceOfFunds[];
// 	productReferences: ProductReference[];
// 	agentPropertyTypes: AgentPropertyType[];
// 	reservation: Reservation;
// 	reservationPaymentPlan: PaymentPlan;
// }


@Component({
	selector: 'app-detail',
	templateUrl: './detail.component.html',
	styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {

	apiUrl = env.apiUrl;

	reservationId: number;
	reservation: Reservation;
	isInitialized: boolean;

	formGroup: UntypedFormGroup;

	fullName: UntypedFormControl;
	genderId: UntypedFormControl;
	dob: UntypedFormControl;
	pob: UntypedFormControl;
	religionId: UntypedFormControl;

	maritalStatusId: UntypedFormControl;
	email: UntypedFormControl;
	identityCode: UntypedFormControl;
	npwp: UntypedFormControl;

	identityAddress: UntypedFormControl;
	mailingAddress: UntypedFormControl;
	homePhone: UntypedFormControl;
	handPhone: UntypedFormControl;
	// occupation: FormControl;
	occupationId: UntypedFormControl;

	companyName: UntypedFormControl;
	companyAddress: UntypedFormControl;
	companyPhone: UntypedFormControl;
	companyFax: UntypedFormControl;

	purposeOfPurchaseId: UntypedFormControl;
	purposeOfPurchaseRemark: UntypedFormControl;
	sourceOfFundsId: UntypedFormControl;
	sourceOfFundsRemark: UntypedFormControl;

	paymentPlanId: UntypedFormControl;
	paymentMethodId: UntypedFormControl;
	unitPrice: UntypedFormControl;
	discountAmount: UntypedFormControl;
	discountPercent: UntypedFormControl;
	salesPrice: UntypedFormControl;
	promo: UntypedFormControl;
	remark: UntypedFormControl;

	productReferenceId: UntypedFormControl;
	productReferenceRemark: UntypedFormControl;

	agentPropertyTypeId: UntypedFormControl;
	salesName: UntypedFormControl;
	salesSupervisorName: UntypedFormControl;
	salesManagerName: UntypedFormControl;
	agentPropertyName: UntypedFormControl;
	agentPropertyLeadName: UntypedFormControl;
	agentPropertyOfficePhone: UntypedFormControl;
	agentPropertySalesPhone: UntypedFormControl;

	identityProvinceId: UntypedFormControl;
	identityCityId: UntypedFormControl;
	identityDistrictId: UntypedFormControl;
	identitySubdistrictId: UntypedFormControl;

	mailingProvinceId: UntypedFormControl;
	mailingCityId: UntypedFormControl;
	mailingDistrictId: UntypedFormControl;
	mailingSubdistrictId: UntypedFormControl;

	currentDate: Date;
	genders: Gender[] = [];
	religions: Religion[] = [];
	occupations: Occupation[] = [];
	maritalStatuses: MaritalStatus[] = [];
	purposeOfPurchases: PurposeOfPurchase[] = [];
	sourceOfFundses: SourceOfFunds[] = [];
	productReferences: ProductReference[] = [];
	agentPropertyTypes: AgentPropertyType[] = [];

	reservationPaymentPlan: PaymentPlan;

	formSubmitAttempt: boolean;

	totalPrice: number;

	isReadOnly: boolean;
	isSprPrinting: boolean;
	isLoading: boolean;
	isPaymentPlanChanged: boolean;

	isCanceling: boolean;

	paymentDate: Date;
	isSaving: boolean;
	isRequestingApproval: boolean;
	isApproving: boolean;
	isFinalizing: boolean;
	isSprPreviewing: boolean;

	uploadedKtp: any;
	uploadedNpwp: any;
	uploadedProofOfTransfer: any;

	identityProvinces: Province[] = [];
	identityCities: City[] = [];
	identityDistricts: District[] = [];
	identitySubdistricts: Subdistrict[] = [];

	mailingProvinces: Province[] = [];
	mailingCities: City[] = [];
	mailingDistricts: District[] = [];
	mailingSubdistricts: Subdistrict[] = [];

	constructor(
		private activatedRoute: ActivatedRoute,
		private detailService: DetailService,
		private router: Router,
		private formBuilder: UntypedFormBuilder,
		private dialog: MatDialog
	) { }

	ngOnInit(): void {
		this.isLoading = false;
		this.isInitialized = false;
		this.formSubmitAttempt = false;
		this.isSaving = false;
		this.isApproving = false;
		this.isFinalizing = false;
		this.isSprPreviewing = false;
		this.isPaymentPlanChanged = false;
		this.reservationId = +this.activatedRoute.snapshot.paramMap.get('reservationId');
		console.log('reservationId', this.reservationId);
		this.initForm()
			.then(() => this.getCurrentDate())
			.then(() => this.getGenders())
			.then(() => this.getReligions())
			.then(() => this.getOccupations())
			.then(() => this.getMaritalStatuses())
			.then(() => this.getPurposeOfPurchases())
			.then(() => this.getSourceOfFundses())
			.then(() => this.getProductReferences())
			.then(() => this.getAgentPropertyTypes())
			.then(() => this.getProvinces())
			.then(() => this.getReservation())
			.then(() => this.getIdentityCities())
			.then(() => this.getIdentityDistricts())
			.then(() => this.getIdentitySubdistricts())
			.then(() => this.getMailingCities())
			.then(() => this.getMailingDistricts())
			.then(() => this.getMailingSubdistricts())
			.then(() => this.getReservation())
			.then(() => this.getReservationPaymentPlan())
			.then(() => this.isInitialized = true);
	}

	getCurrentDate() {
		return this.detailService.getCurrentDate()
			.toPromise()
			.then((currentDate: Date) => {
				this.currentDate = currentDate;
			});
	}

	initForm() {
		return new Promise<void>((resolve, reject) => {
			this.fullName = new UntypedFormControl('', [Validators.required]);
			this.genderId = new UntypedFormControl(1);
			this.dob = new UntypedFormControl('', [Validators.required]);
			this.pob = new UntypedFormControl('');
			this.religionId = new UntypedFormControl(1);
			this.maritalStatusId = new UntypedFormControl(1);
			this.email = new UntypedFormControl('', [Validators.required]);
			this.identityCode = new UntypedFormControl('', [Validators.required]);
			this.npwp = new UntypedFormControl('', [Validators.required]);
			this.identityAddress = new UntypedFormControl('', [Validators.required]);
			this.mailingAddress = new UntypedFormControl('', [Validators.required]);
			this.homePhone = new UntypedFormControl('', [Validators.required]);
			this.handPhone = new UntypedFormControl('', [Validators.required]);
			// this.occupation = new FormControl('', [Validators.required]);
			this.occupationId = new UntypedFormControl();
			this.companyName = new UntypedFormControl('');
			this.companyAddress = new UntypedFormControl('');
			this.companyPhone = new UntypedFormControl('');
			this.companyFax = new UntypedFormControl('');
			this.purposeOfPurchaseId = new UntypedFormControl(1);
			this.purposeOfPurchaseRemark = new UntypedFormControl('');
			this.sourceOfFundsId = new UntypedFormControl(1);
			this.sourceOfFundsRemark = new UntypedFormControl('');
			this.paymentPlanId = new UntypedFormControl(1);
			this.paymentMethodId = new UntypedFormControl(1);
			this.unitPrice = new UntypedFormControl(0);

			this.discountAmount = new UntypedFormControl(0);
			this.discountPercent = new UntypedFormControl(0);

			this.salesPrice = new UntypedFormControl(0);
			this.promo = new UntypedFormControl('');
			this.remark = new UntypedFormControl('');
			this.productReferenceId = new UntypedFormControl(1);
			this.productReferenceRemark = new UntypedFormControl('');

			this.agentPropertyTypeId = new UntypedFormControl(1);
			this.salesName = new UntypedFormControl('');
			this.salesSupervisorName = new UntypedFormControl('');
			this.salesManagerName = new UntypedFormControl('');
			this.agentPropertyName = new UntypedFormControl('');
			this.agentPropertyLeadName = new UntypedFormControl('');
			this.agentPropertyOfficePhone = new UntypedFormControl('');
			this.agentPropertySalesPhone = new UntypedFormControl('');

			this.identityProvinceId = new UntypedFormControl(null, [Validators.required, Validators.min(1)]);
			this.identityCityId = new UntypedFormControl(0, [Validators.required, Validators.min(1)]);
			this.identityDistrictId = new UntypedFormControl(0, [Validators.required, Validators.min(1)]);
			this.identitySubdistrictId = new UntypedFormControl(0, [Validators.required, Validators.min(1)]);

			this.mailingProvinceId = new UntypedFormControl(null, [Validators.required, Validators.min(1)]);
			this.mailingCityId = new UntypedFormControl(0, [Validators.required, Validators.min(1)]);
			this.mailingDistrictId = new UntypedFormControl(0, [Validators.required, Validators.min(1)]);
			this.mailingSubdistrictId = new UntypedFormControl(0, [Validators.required, Validators.min(1)]);

			this.formGroup = this.formBuilder.group({
				fullName: this.fullName,
				genderId: this.genderId,
				religionId: this.religionId,
				maritalStatusId: this.maritalStatusId,
				dob: this.dob,
				pob: this.pob,
				identityCode: this.identityCode,
				email: this.email,
				npwp: this.npwp,
				identityAddress: this.identityAddress,
				mailingAddress: this.mailingAddress,
				homePhone: this.homePhone,
				handPhone: this.handPhone,
				// occupation: this.occupation,
				occupationId: this.occupationId,
				companyName: this.companyName,
				companyAddress: this.companyAddress,
				companyPhone: this.companyPhone,
				companyFax: this.companyFax,

				purposeOfPurchaseId: this.purposeOfPurchaseId,
				purposeOfPurchaseRemark: this.purposeOfPurchaseRemark,
				sourceOfFundsId: this.sourceOfFundsId,
				sourceOfFundsRemark: this.sourceOfFundsRemark,

				paymentPlanId: this.paymentPlanId,
				paymentMethodId: this.paymentMethodId,
				unitPrice: this.unitPrice,

				discountAmount: this.discountAmount,
				discountPercent: this.discountPercent,

				salesPrice: this.salesPrice,
				promo: this.promo,
				remark: this.remark,

				productReferenceId: this.productReferenceId,
				productReferenceRemark: this.productReferenceRemark,

				agentPropertyTypeId: this.agentPropertyTypeId,
				salesName: this.salesName,
				salesSupervisorName: this.salesSupervisorName,
				salesManagerName: this.salesManagerName,
				agentPropertyName: this.agentPropertyName,
				agentPropertyLeadName: this.agentPropertyLeadName,
				agentPropertyOfficePhone: this.agentPropertyOfficePhone,
				agentPropertySalesPhone: this.agentPropertySalesPhone,

				identityProvinceId: this.identityProvinceId,
				identityCityId: this.identityCityId,
				identityDistrictId: this.identityDistrictId,
				identitySubdistrictId: this.identitySubdistrictId,

				mailingProvinceId: this.mailingProvinceId,
				mailingCityId: this.mailingCityId,
				mailingDistrictId: this.mailingDistrictId,
				mailingSubdistrictId: this.mailingSubdistrictId,
			})


			resolve();
		});
	}

	getGenders() {
		return this.detailService.getGenders()
			.toPromise()
			.then((genders: Gender[]) => {
				this.genders = genders;
			});
	}

	getReligions() {
		return this.detailService.getReligions()
			.toPromise()
			.then((religions: Religion[]) => {
				this.religions = religions;
			});
	}

	getOccupations() {
		return this.detailService.getOccupations()
			.toPromise()
			.then((occupations: Occupation[]) => {
				this.occupations = occupations;
			});
	}

	getMaritalStatuses() {
		return this.detailService.getMaritalStatuses()
			.toPromise()
			.then((maritalStatuses: MaritalStatus[]) => {
				this.maritalStatuses = maritalStatuses;
			});
	}

	getPurposeOfPurchases() {
		return this.detailService.getPurposeOfPurchases()
			.toPromise()
			.then((purposeOfPurchases: PurposeOfPurchase[]) => {
				this.purposeOfPurchases = purposeOfPurchases;
			});
	}

	getSourceOfFundses() {
		return this.detailService.getSourceOfFundses()
			.toPromise()
			.then((sourceOfFundses: SourceOfFunds[]) => {
				this.sourceOfFundses = sourceOfFundses;
			});
	}

	getProductReferences() {
		return this.detailService.getProductReferences()
			.toPromise()
			.then((productReferences: ProductReference[]) => {
				this.productReferences = productReferences;
			});
	}

	getAgentPropertyTypes() {
		return this.detailService.getAgentPropertyTypes()
			.toPromise()
			.then((agentPropertyTypes: AgentPropertyType[]) => {
				this.agentPropertyTypes = agentPropertyTypes;
			});
	}

	getProvinces() {
		return this.detailService.getProvinces()
			.toPromise()
			.then((provinces: Province[]) => {
				this.identityProvinces = provinces;
				this.mailingProvinces = provinces;
			})
	}

	identityProvinceChanged() {
		this.identityCityId.setValue(0);
		this.identityDistrictId.setValue(0);
		this.identitySubdistrictId.setValue(0);
		this.identityCities = [];
		this.identityDistricts = [];
		this.identitySubdistricts = [];
		this.getIdentityCities();
	}

	getIdentityCities() {
		return this.detailService.getCities(this.identityProvinceId.value)
			.toPromise()
			.then((cities: City[]) => {
				this.identityCities = cities;
			})
	}

	identityCityChanged() {
		this.identityDistrictId.setValue(0);
		this.identitySubdistrictId.setValue(0);
		this.identityDistricts = [];
		this.identitySubdistricts = [];
		this.getIdentityDistricts();
	}

	getIdentityDistricts() {
		return this.detailService.getDistricts(this.identityProvinceId.value, this.identityCityId.value)
			.toPromise()
			.then((districts: District[]) => {
				this.identityDistricts = districts;
			})
	}

	identityDistrictChanged() {
		console.log('identityDistrictChanged');
		this.identitySubdistrictId.setValue(0);
		this.identitySubdistricts = [];
		this.getIdentitySubdistricts();
	}

	getIdentitySubdistricts() {
		return this.detailService.getSubdistricts(this.identityProvinceId.value, this.identityCityId.value, this.identityDistrictId.value)
			.toPromise()
			.then((subdistricts: Subdistrict[]) => {
				this.identitySubdistricts = subdistricts;
			})
	}

	mailingProvinceChanged() {
		this.mailingCityId.setValue(0);
		this.mailingDistrictId.setValue(0);
		this.mailingSubdistrictId.setValue(0);
		this.mailingCities = [];
		this.mailingDistricts = [];
		this.mailingSubdistricts = [];
		this.getMailingCities();
	}

	getMailingCities() {
		return this.detailService.getCities(this.mailingProvinceId.value)
			.toPromise()
			.then((cities: City[]) => {
				this.mailingCities = cities;
			})
	}

	mailingCityChanged() {
		this.mailingDistrictId.setValue(0);
		this.mailingSubdistrictId.setValue(0);
		this.mailingDistricts = [];
		this.mailingSubdistricts = [];
		this.getMailingDistricts();
	}

	getMailingDistricts() {
		return this.detailService.getDistricts(this.mailingProvinceId.value, this.mailingCityId.value)
			.toPromise()
			.then((districts: District[]) => {
				this.mailingDistricts = districts;
			})
	}

	mailingDistrictChanged() {
		this.mailingSubdistrictId.setValue(0);
		this.mailingSubdistricts = [];
		this.getMailingSubdistricts();
	}

	getMailingSubdistricts() {
		return this.detailService.getSubdistricts(this.mailingProvinceId.value, this.mailingCityId.value, this.mailingDistrictId.value)
			.toPromise()
			.then((subdistricts: Subdistrict[]) => {
				this.mailingSubdistricts = subdistricts;
			})
	}

	getReservation() {
		return this.detailService.getReservation(this.reservationId)
			.toPromise()
			.then((reservation: Reservation) => {
				this.reservation = reservation;

				console.log('reservation', reservation);

				this.formGroup.setValue({
					fullName: reservation.fullName,
					genderId: reservation.genderId,
					religionId: reservation.religionId,
					maritalStatusId: reservation.maritalStatusId,
					dob: reservation.dob,
					pob: reservation.pob,
					identityCode: reservation.identityCode,
					email: reservation.email,
					npwp: reservation.npwp,
					identityAddress: reservation.identityAddress,
					mailingAddress: reservation.mailingAddress,
					homePhone: reservation.homePhone,
					handPhone: reservation.handPhone,
					occupationId: reservation.occupationId,
					companyName: reservation.companyName,
					companyAddress: reservation.companyAddress,
					companyPhone: reservation.companyPhone,
					companyFax: reservation.companyFax,

					purposeOfPurchaseId: reservation.purposeOfPurchaseId,
					purposeOfPurchaseRemark: reservation.purposeOfPurchaseRemark,
					sourceOfFundsId: reservation.sourceOfFundsId,
					sourceOfFundsRemark: reservation.sourceOfFundsRemark,

					paymentPlanId: reservation.paymentPlanId,
					paymentMethodId: reservation.paymentMethodId,
					unitPrice: reservation.unitPrice,
					discountAmount: reservation.discountAmount,
					discountPercent: reservation.discountPercent,
					salesPrice: reservation.salesPrice,
					promo: reservation.promo,
					remark: reservation.remark,

					productReferenceId: reservation.productReferenceId,
					productReferenceRemark: reservation.productReferenceRemark,

					agentPropertyTypeId: reservation.agentPropertyTypeId,
					salesName: reservation.salesName,
					salesSupervisorName: reservation.salesSupervisorName,
					salesManagerName: reservation.salesManagerName,
					agentPropertyName: reservation.agentPropertyName,
					agentPropertyLeadName: reservation.agentPropertyLeadName,
					agentPropertyOfficePhone: reservation.agentPropertyOfficePhone,
					agentPropertySalesPhone: reservation.agentPropertySalesPhone,

					identityProvinceId: reservation.identityProvinceId || 0,
					identityCityId: reservation.identityCityId || 0,
					identityDistrictId: reservation.identityDistrictId || 0,
					identitySubdistrictId: reservation.identitySubdistrictId || 0,

					mailingProvinceId: reservation.mailingProvinceId || 0,
					mailingCityId: reservation.mailingCityId || 0,
					mailingDistrictId: reservation.mailingDistrictId || 0,
					mailingSubdistrictId: reservation.mailingSubdistrictId || 0,
				})

				if (!reservation.identitySubdistrictId || !reservation.mailingSubdistrictId) {
					console.log('mark form group as dirty');
					this.formGroup.markAsDirty();
				}
			})
	}

	getReservationPaymentPlan() {
		return this.detailService.getReservationPaymentPlan(this.reservationId, this.reservation.reservationPaymentPlanId)
			.toPromise()
			.then((paymentPlan: PaymentPlan) => {
				this.reservationPaymentPlan = paymentPlan;
			})
			.then(() => this.calculatePaymentDates())
			.then(() => this.calcTotalPrice())
			.then(() => {
				this.isReadOnly = this.reservation.reservationStatusId > 1;
			});
	}

	discountPercentChanged(percent: number) {
		// console.log('discountPercent value', val);
		// const percent: number = +val.replace(/\./g, '');
		if (+this.discountPercent.value !== percent) {
			this.isPaymentPlanChanged = true;
		}

		this.discountPercent.setValue(percent);

		const discountAmount = (this.unitPrice.value * percent) / 100;
		this.discountAmount.setValue(discountAmount);

		this.salesPrice.setValue(this.unitPrice.value - discountAmount);

		this.applyDiscount();
		this.calcTotalPrice();
	}

	discountAmountChanged(val: string) {
		console.log('discountAmount value', val);
		this.discountAmount.markAsDirty();
		const amount: number = +val.replace(/\./g, '');
		if (+this.discountAmount.value !== amount) {
			this.isPaymentPlanChanged = true;
		}

		this.discountAmount.setValue(amount);

		const discountPercent = amount / this.unitPrice.value * 100;
		this.discountPercent.setValue(discountPercent);

		this.salesPrice.setValue(this.unitPrice.value - this.discountAmount.value);

		this.applyDiscount();
		this.calcTotalPrice();
	}

	calcTotalPrice() {
		console.log('calcTotalPrice');
		this.totalPrice = 0;
		for (const sp of this.reservationPaymentPlan.paymentPlanDetails) {
			const totalPaymentPlanDatasPrice = sp.paymentPlanDatas.map(d => +d.priceAmount).reduce((total, num) => total + num);
			this.totalPrice += totalPaymentPlanDatasPrice;
		}
	}

	applyDiscount() {
		const cpp = this.reservationPaymentPlan;
		console.log('sss', cpp.unitPrice, this.discountAmount.value);

		const price = cpp.unitPrice - this.discountAmount.value;
		let priceAmountSum = 0;
		let k = 0;
		let len = cpp.paymentPlanDetails.length - 1;
		for (const p of cpp.paymentPlanDetails) {
			let pa = p.priceAmount;
			if (!pa) {
				pa = cpp.unitPrice * p.pricePercent / 100;
				if (p.deductFromId) {
					pa -= p.deductAmount;
				}
				p.priceAmount = pa;
			}

			if (k < len) {
				priceAmountSum += p.priceAmount;
				k++;
				continue;
			}

			p.priceAmount = price - priceAmountSum;
			let priceAmount = p.priceAmount / p.numberOfInstall;

			let diff = 0;
			let i = 0;
			for (const ppd of p.paymentPlanDatas) {
				let adjustedPrice = Math.ceil(priceAmount / 1000) * 1000;
				if (i++ < (p.numberOfInstall - 1)) {
					diff += priceAmount - adjustedPrice;
				} else {
					adjustedPrice = priceAmount + diff;
				}

				ppd.priceAmount = adjustedPrice;
				ppd.pricePercent = Math.ceil(adjustedPrice / price * 10000) / 100;
			}

		}
	}

	calculatePaymentDates() {
		console.log('calculatePaymentDates');
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

	customPlan() {
		this.dialog
			.open(CustomPlanComponent, {
				width: '600px',
				// height: '600px',
				data: {
					salesPrice: this.salesPrice.value,
					// paymentPlans: this.paymentPlans,
					// reservationPaymentPlanId: this.reservationPaymentPlan.paymentPlanId
					reservationPaymentPlan: this.reservationPaymentPlan
				}
			})
			.afterClosed()
			.subscribe(paymentPlan => {
				if (paymentPlan) {
					this.isPaymentPlanChanged = true;
					let i = 0;
					for (const pp of paymentPlan.paymentPlanDetails) {
						for (const ppd of pp.paymentPlanDatas) {
							ppd.no = ++i;
						}
					}
					this.reservationPaymentPlan = paymentPlan;
					this.formGroup.markAsDirty();
					// this.paymentPlans = this.paymentPlans.filter((p: PaymentPlan) => !(+p.paymentPlanId === 0));
					// this.paymentPlans.push(result);
					// this.paymentPlanId.markAsDirty();

					// setTimeout(() => {
					// 	this.paymentMethodId.setValue(0);
					// 	this.paymentPlanId.setValue(0);
					// this.paymentPlanChanged(0);
					// })
				}
			})
	}

	convertImageToBase64(file) {
		console.log(file);
		return new Promise((resolve) => {
			const fileReader: FileReader = new FileReader();
			fileReader.onloadend = () => {
				resolve(fileReader.result.toString());
			};
			fileReader.onerror = (e) => console.error(e);
			fileReader.readAsDataURL(file);
		});
	}

	uploadKtpChanged(e) {
		const file: File = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];
		if (file) {
			this.convertImageToBase64(file)
				.then((base64Image) => {
					e.target.value = '';
					this.formGroup.markAsDirty();
					this.uploadedKtp = base64Image;
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

	finalize() {
		this.isFinalizing = true;
		this.detailService.finalize(this.reservationId).subscribe((salesId: number) => {
			this.isFinalizing = false;
			this.router.navigateByUrl('/backend/property-management/sales/' + salesId);
		});
	}

	save() {
		this.isSaving = true;
		this.formSubmitAttempt = true;
		if (this.formGroup.invalid) {
			this.isSaving = false;
			return;
		}

		const data = this.formGroup.value;
		data.dob = formatDate(data.dob, 'yyyy-MM-dd', 'en');
		data.isPaymentPlanChanged = this.isPaymentPlanChanged;
		data.lastReservationPaymentPlanId = this.reservation.reservationPaymentPlanId;
		data.paymentPlan = JSON.stringify(this.reservationPaymentPlan);

		const formData = new FormData();
		formData.append('data', JSON.stringify(data));

		if (this.uploadedKtp) {
			formData.append('ktp', this.dataURItoBlob(this.uploadedKtp), 'ktp.jpg');
		}

		if (this.uploadedNpwp) {
			formData.append('npwp', this.dataURItoBlob(this.uploadedNpwp), 'npwp.jpg');
		}

		if (this.uploadedProofOfTransfer) {
			formData.append('proof-of-transfer', this.dataURItoBlob(this.uploadedProofOfTransfer), 'proof-of-transfer.jpg');
		}

		this.detailService.update(this.reservationId, formData).subscribe(result => {
			this.isSaving = false;
			this.ngOnInit();
		})
	}

	requestApproval() {
		this.isRequestingApproval = true;
		this.detailService.requestApproval(this.reservationId).subscribe(result => {
			this.isRequestingApproval = false;
			this.ngOnInit();
		})
	}

	approve() {
		this.isApproving = true;
		this.detailService.approve(this.reservationId, this.reservation.reservationPaymentPlanId).subscribe(result => {
			this.isApproving = false;
			this.ngOnInit();
		})
	}

	cancelation() {
		this.isCanceling = true;
		if (!confirm('Are you sure you want to cancel this reservation?')) {
			this.isCanceling = false;
			return;
		}

		this.detailService.cancelation(this.reservationId).subscribe(result => {
			this.isCanceling = false;
			this.router.navigateByUrl('/backend/property-management/reservation');
		})
	}

	printSpr() {
		this.isSprPrinting = true;
		this.detailService.printSpr(this.reservationId).subscribe(result => {
			console.log(result);
			window.open(result);
			this.isSprPrinting = false;
		})
	}

	previewSpr() {
		this.isSprPreviewing = true;
		this.detailService.previewSpr(this.reservationId).subscribe(result => {
			window.open(result);
			this.isSprPreviewing = false;
		})
	}

	changeUnit() {
		this.dialog
			.open(ChangeUnitComponent, {
				width: '500px',
				height: '605px',
				data: {
					unitId: this.reservation.unitId
				}
			})
			.afterClosed()
			.subscribe((unit: Unit) => {
				this.reservation.unitId = unit.unitId;
				this.reservation.unitName = unit.unitName;
				this.reservation.unitPrice = unit.cashPrice;
				this.reservation.unitTypeName = unit.unitTypeName;
				this.unitPrice.setValue(unit.cashPrice);
			})
	}
}
