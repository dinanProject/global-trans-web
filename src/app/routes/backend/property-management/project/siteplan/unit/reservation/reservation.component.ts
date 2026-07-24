import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { BackendService } from 'src/app/routes/backend/backend.service';
import { SessionService } from 'src/app/services/session.service';
import { WebSocketService } from 'src/app/services/websocket.service';
import { EditPaymentPlanComponent } from './edit-payment-plan/edit-payment-plan.component';
import { PaymentPlan, ReservationData, ReservationService } from './reservation.service';

@Component({
	selector: 'app-reservation',
	templateUrl: './reservation.component.html',
	styleUrls: ['./reservation.component.scss']
})
export class ReservationComponent implements OnInit {

	userId: number;

	unitId: number;
	projectId: number;

	reservationData: ReservationData;
	selectedPaymentPlan: PaymentPlan;
	paymentPlans: PaymentPlan[];
	loadedPaymentPlans: PaymentPlan[];

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
	unitPrice: UntypedFormControl;
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

	formSubmitAttempt: boolean;
	currentDate: Date;
	totalPrice: number;

	ktpBase64Image: any;
	npwpBase64Image: any;
	proofOfTransferBase64Image: any;

	isKtpInvalid: boolean;
	isNpwpInvalid: boolean;
	isProofOfTransferInvalid: boolean;

	isSaving: boolean;

	timeout: number;
	errorMessage: string;

	constructor(
		private activatedRoute: ActivatedRoute,
		private backendService: BackendService,
		private reservationService: ReservationService,
		private webSocketService: WebSocketService,
		private sessionService: SessionService,
		private formBuilder: UntypedFormBuilder,
		private dialog: MatDialog,
		private router: Router
	) { }

	ngOnInit(): void {
		this.isInitialized = false;
		this.unitId = +this.activatedRoute.snapshot.paramMap.get('unitId');
		this.projectId = +this.activatedRoute.snapshot.paramMap.get('projectId');
		this.userId = this.sessionService.getUser().userId;
		this.backendService.hideSidebar()
			.then(() => this.initForm())
			.then(() => this.getReservationData())
			.then(() => this.initWebSocket())
			.then(() => {
				this.isInitialized = true;
			})
	}

	initWebSocket() {
		return new Promise<void>((resolve) => {
			setTimeout(() => {
				this.webSocketService.listen('property-management', '/unit/status-changed').subscribe((result: any) => {
					const data = result.data;
					console.log('status-changed', data);

					if (data.unitId !== this.reservationData.unit.unitId) {
						return;
					}
				});

				this.webSocketService.listen('property-management', '/unit/lock-tick').subscribe((result: any) => {
					const data = result.data;
					if (data.unitId === this.reservationData.unit.unitId && +data.userId === +this.userId) {
						this.timeout = data.currentTimeout;
					}
				});

				this.webSocketService.listen('property-management', '/unit/locked').subscribe((result: any) => {
					const data = result.data;
					console.log('locked', data);

					if (data.unitId !== this.reservationData.unit.unitId) {
						return;
					}

					this.reservationData.unit.isLocked = true;
					this.reservationData.unit.lockedUserName = data.fullName;
					this.reservationData.unit.formattedLockedDate = formatDate(data.lockedDate, 'dd MMM yyyy HH:ss', 'en');
				});

				this.webSocketService.listen('property-management', '/unit/unlocked').subscribe((result: any) => {
					const data = result.data;
					console.log('unlocked', data);

					if (data.unitId !== this.reservationData.unit.unitId) {
						return;
					}

					this.router.navigate(['..'], { relativeTo: this.activatedRoute });
				});

				resolve();

			}, 100);
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

			this.occupationId = new UntypedFormControl('', [Validators.required]);
			this.companyName = new UntypedFormControl('');
			this.companyAddress = new UntypedFormControl('');
			this.companyPhone = new UntypedFormControl('');
			this.companyFax = new UntypedFormControl('');
			this.purposeOfPurchaseId = new UntypedFormControl(1);
			this.purposeOfPurchaseRemark = new UntypedFormControl('');
			this.sourceOfFundsId = new UntypedFormControl(1);
			this.sourceOfFundsRemark = new UntypedFormControl('');
			this.paymentPlanId = new UntypedFormControl(1);
			this.unitPrice = new UntypedFormControl(0);
			this.promo = new UntypedFormControl('');
			this.remark = new UntypedFormControl('');
			this.productReferenceId = new UntypedFormControl(1);
			this.productReferenceRemark = new UntypedFormControl('');

			this.agentPropertyTypeId = new UntypedFormControl(1);
			this.salesName = new UntypedFormControl('', [Validators.required]);
			this.salesSupervisorName = new UntypedFormControl('');
			this.salesManagerName = new UntypedFormControl('');
			this.agentPropertyName = new UntypedFormControl('');
			this.agentPropertyLeadName = new UntypedFormControl('');
			this.agentPropertyOfficePhone = new UntypedFormControl('');
			this.agentPropertySalesPhone = new UntypedFormControl('');

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
				unitPrice: this.unitPrice,
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
				agentPropertySalesPhone: this.agentPropertySalesPhone
			})
			resolve();
		});
	}

	getReservationData() {
		return new Promise<void>((resolve, reject) => {
			this.reservationService.getReservationData(this.projectId, this.unitId).subscribe((reservationData: ReservationData) => {
				this.reservationData = reservationData;
				console.log('this.reservationData', this.reservationData);
				const paymentPlans = this.createPaymentPlanDatas(this.reservationData.paymentPlans);
				this.paymentPlans = paymentPlans;
				this.loadedPaymentPlans = JSON.parse(JSON.stringify(paymentPlans));

				console.log('this.paymentPlans', this.paymentPlans);
				this.selectedPaymentPlan = this.paymentPlans[0];
				this.paymentPlanId.setValue(this.selectedPaymentPlan.paymentPlanId);

				this.unitPrice.setValue(this.selectedPaymentPlan.price);
				this.currentDate = reservationData.currentDate;
				this.calcTotalPrice();
				resolve();
			})
		});
	}

	get isNotAvailable() {
		return this.reservationData.unit.salesStatusId > 1;
	}

	paymentPlanChanged(e: Event) {
		this.selectedPaymentPlan = this.paymentPlans.find((p: PaymentPlan) => +p.paymentPlanId === +(e.target as HTMLSelectElement).value);
		this.unitPrice.setValue(this.selectedPaymentPlan.price);
		this.calcTotalPrice();
	}

	createPaymentPlanDatas(paymentPlans) {
		for (const pp of paymentPlans) {
			const price: number = pp.price;
			const paymentDate = new Date();

			let no = 0;
			for (const p of pp.paymentPlanDetails) {

				p.paymentPlanDatas = [];
				let priceAmount = p.priceAmount
				// if price is percent
				if (!p.priceAmount) {
					priceAmount = price * p.pricePercent / 100;
				}

				// if there is deduction
				if (p.deductFromId) {
					priceAmount = priceAmount - p.deductAmount;
				}

				// divide price with the number of install
				priceAmount = priceAmount / p.numberOfInstall;

				let diff = 0;
				for (let i = 0; i < p.numberOfInstall; i++) {
					let adjustedPrice = Math.ceil(priceAmount / 1000) * 1000;
					if (i < (p.numberOfInstall - 1)) {
						diff += priceAmount - adjustedPrice;
					} else {
						adjustedPrice = priceAmount + diff;
					}
					// payment scheme numbering if number of install more than 1 time
					const paymentSchemeName = p.numberOfInstall > 1 ? `${p.paymentSchemeName} ${i + 1}` : p.paymentSchemeName;
					p.paymentPlanDatas.push({
						no: ++no,
						paymentDate: new Date(paymentDate),
						paymentSchemeId: p.paymentSchemeId,
						paymentSchemeName: paymentSchemeName,
						priceAmount: adjustedPrice
					})

					paymentDate.setDate(paymentDate.getDate() + p.interval);
				}
			}
		}
		return paymentPlans;
	}

	editPaymentPlan() {
		this.dialog
			.open(EditPaymentPlanComponent, {
				width: '600px',
				// height: '700px',
				data: {
					paymentPlan: this.selectedPaymentPlan
				}
			})
			.afterClosed()
			.subscribe((paymentPlan: PaymentPlan) => {
				if (paymentPlan) {
					let i = 0;
					for (const pp of paymentPlan.paymentPlanDetails) {
						for (const ppd of pp.paymentPlanDatas) {
							ppd.no = ++i;
						}
					}

					for (const p of this.paymentPlans) {
						if (p.paymentPlanId === paymentPlan.paymentPlanId) {
							p.isCustom = true;
							p.paymentPlanDetails = paymentPlan.paymentPlanDetails;
						}
					}
				}
			})
	}

	resetSelectedPaymentPlan() {
		const loadedPaymentPlan: PaymentPlan = this.loadedPaymentPlans.find((p: PaymentPlan) => p.paymentPlanId === this.selectedPaymentPlan.paymentPlanId);
		for (const p of this.paymentPlans) {
			if (p.paymentPlanId === loadedPaymentPlan.paymentPlanId) {
				p.isCustom = false;
				p.paymentPlanDetails = loadedPaymentPlan.paymentPlanDetails;
			}
		}
	}

	calcTotalPrice() {
		this.totalPrice = 0;
		for (const sp of this.selectedPaymentPlan.paymentPlanDetails) {
			this.totalPrice += sp.paymentPlanDatas.map(d => +d.priceAmount).reduce((total, num) => total + num);
		}
		console.log('totalPrice', this.totalPrice);
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
					this.ktpBase64Image = base64Image;
					// this.mapImage = base64Image;
					// this.isSiteplanInitialized = true;
					// this.isMapUpload = true;
				});
		}
	}

	uploadNpwpChanged(e) {
		const file: File = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];
		if (file) {
			this.convertImageToBase64(file)
				.then((base64Image) => {
					e.target.value = '';
					this.npwpBase64Image = base64Image;
				});
		}
	}

	uploadProofOfTransferChanged(e) {
		const file: File = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];
		if (file) {
			this.convertImageToBase64(file)
				.then((base64Image) => {
					e.target.value = '';
					this.proofOfTransferBase64Image = base64Image;
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

	unlock() {
		return this.webSocketService.invoke('/property-management/unit/unlock', { unitId: this.unitId }).pipe(
			map(data => {
				if (data.status !== 'success') {
					// tslint:disable-next-line:no-string-throw
					// throw data;
					throw {
						data: 'fail',
						message: data.message
					};
				}
			})
		).toPromise();
	}

	submit() {
		this.isSaving = true;
		this.formSubmitAttempt = true;
		this.errorMessage = null;

		if (+this.agentPropertyTypeId.value === 2) {
			if (!this.agentPropertyLeadName.value) {
				this.agentPropertyLeadName.setErrors({
					required: true
				});
			}
		}

		if (this.formGroup.invalid) {
			console.log('invalid', this.formGroup);
			this.isSaving = false;
			this.errorMessage = 'Please fill all mandatory field';
			return;
		}

		// if (!this.ktpBase64Image) {
		// 	this.isSaving = false;
		// 	return;
		// }

		// if (!this.npwpBase64Image) {
		// 	this.isSaving = false;
		// 	return;
		// }

		// if (!this.proofOfTransferBase64Image) {
		// 	this.isSaving = false;
		// 	return;
		// }

		const data = this.formGroup.value;
		data.dob = formatDate(data.dob, 'yyyy-MM-dd', 'en');
		data.paymentMethodId = this.selectedPaymentPlan.paymentMethodId;
		const formData = new FormData();
		for (const [key, value] of Object.entries(data)) {
			formData.append(key, value?.toString());
		}

		formData.append('paymentPlan', JSON.stringify(this.selectedPaymentPlan));
		if (this.ktpBase64Image) {
			formData.append('ktp', this.dataURItoBlob(this.ktpBase64Image), 'ktp.jpg');
		}

		if (this.npwpBase64Image) {
			formData.append('npwp', this.dataURItoBlob(this.npwpBase64Image), 'npwp.jpg');
		}

		if (this.proofOfTransferBase64Image) {
			formData.append('proof-of-transfer', this.dataURItoBlob(this.proofOfTransferBase64Image), 'proof-of-transfer.jpg');
		}

		this.reservationService.save(this.projectId, this.unitId, formData).subscribe(result => {
			if (result) {
				this.unlock().then(() => {
					this.router.navigate(['../../'], {
						relativeTo: this.activatedRoute
					});
				});
				// this.router.navigateByUrl('/', { skipLocationChange: true });
				console.log(result);
			}
		}, err => {
			this.isSaving = false;
			console.log('err', err);
			this.errorMessage = err.error.data;
		})
	}
}
