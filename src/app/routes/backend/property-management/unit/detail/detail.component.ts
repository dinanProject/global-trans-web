import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { Company, DetailService, PaymentPlan, Price, ProgressStatus, Project, SalesStatus, Unit, UnitCategory, UnitType } from './detail.service';
import { PriceComponent } from './price/price.component';

@Component({
	selector: 'app-detail',
	templateUrl: './detail.component.html',
	styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {

	unitId: number;
	projects: Project[];
	companies: Company[];
	unitCategories: UnitCategory[];
	unitTypes: UnitType[];
	salesStatuses: SalesStatus[];
	progressStatuses: ProgressStatus[];

	formGroup: UntypedFormGroup;

	projectId: UntypedFormControl;
	companyId: UntypedFormControl;
	blockName: UntypedFormControl;
	unitNo: UntypedFormControl;
	unitName: UntypedFormControl;
	unitCategoryId: UntypedFormControl;
	unitTypeId: UntypedFormControl;
	lt: UntypedFormControl;
	lb: UntypedFormControl;
	floor: UntypedFormControl;
	bedRoom: UntypedFormControl;
	bathRoom: UntypedFormControl;
	carPort: UntypedFormControl;
	salesStatusId: UntypedFormControl;
	progressStatusId: UntypedFormControl;
	cashPrice: UntypedFormControl;
	isHoek: UntypedFormControl;
	isShowUnit: UntypedFormControl;
	isInhabited: UntypedFormControl;
	isOpen: UntypedFormControl;

	paymentPlans: PaymentPlan[];
	dataSource: MatTableDataSource<Price> = new MatTableDataSource();
	displayedColumns = ['no', 'paymentPlanId', 'price', 'actions'];

	isReadOnly: boolean;
	isInitialized: boolean;
	formSubmitAttempt: boolean;

	constructor(
		// @Inject(MAT_DIALOG_DATA) private data: { unitId: number },
		private activatedRoute: ActivatedRoute,
		private detailService: DetailService,
		private formBuilder: UntypedFormBuilder,
		private dialog: MatDialog
	) { }

	ngOnInit(): void {
		this.isReadOnly = false;
		this.isInitialized = false;
		this.formSubmitAttempt = false;
		// this.unitId = this.data.unitId;
		this.unitId = +this.activatedRoute.snapshot.paramMap.get('unitId');
		this.initForm();
		this.getUnit();
	}

	initForm() {
		this.projectId = new UntypedFormControl(null, [Validators.required]);
		this.companyId = new UntypedFormControl();
		this.blockName = new UntypedFormControl('', [Validators.required]);
		this.unitNo = new UntypedFormControl('', [Validators.required]);
		this.unitName = new UntypedFormControl('', [Validators.required]);
		this.unitCategoryId = new UntypedFormControl();
		this.unitTypeId = new UntypedFormControl();
		this.lt = new UntypedFormControl(0, [Validators.required]);
		this.lb = new UntypedFormControl(0, [Validators.required]);
		this.floor = new UntypedFormControl(0, [Validators.required]);
		this.bedRoom = new UntypedFormControl(0, [Validators.required]);
		this.bathRoom = new UntypedFormControl(0, [Validators.required]);
		this.carPort = new UntypedFormControl(0, [Validators.required]);
		this.salesStatusId = new UntypedFormControl();
		this.progressStatusId = new UntypedFormControl();
		this.cashPrice = new UntypedFormControl(0, [Validators.required]);
		this.isHoek = new UntypedFormControl();
		this.isShowUnit = new UntypedFormControl();
		this.isInhabited = new UntypedFormControl();
		this.isOpen = new UntypedFormControl();
		// this.lastModifiedDate = new FormControl('');
		// this.lastModifiedUser = new FormControl('');

		this.formGroup = this.formBuilder.group({
			projectId: this.projectId,
			companyId: this.companyId,
			blockName: this.blockName,
			unitNo: this.unitNo,
			unitName: this.unitName,
			unitCategoryId: this.unitCategoryId,
			unitTypeId: this.unitTypeId,
			lt: this.lt,
			lb: this.lb,
			floor: this.floor,
			bedRoom: this.bedRoom,
			bathRoom: this.bathRoom,
			carPort: this.carPort,
			salesStatusId: this.salesStatusId,
			progressStatusId: this.progressStatusId,
			cashPrice: this.cashPrice,
			isHoek: this.isHoek,
			isShowUnit: this.isShowUnit,
			isInhabited: this.isInhabited,
			isOpen: this.isOpen,
			// lastModifiedDate: this.lastModifiedDate,
			// lastModifiedUser: this.lastModifiedUser
		});
	}

	getUnit() {
		this.detailService.getUnit(this.unitId).subscribe((data: {
			unit: Unit,
			projects: Project[],
			companies: Company[],
			unitTypes: UnitType[],
			unitCategories: UnitCategory[],
			salesStatuses: SalesStatus[],
			progressStatuses: ProgressStatus[],
			paymentPlans: PaymentPlan[],
			prices: Price[]
		}) => {
			console.log(data);
			this.formGroup.setValue({
				projectId: data.unit.projectId,
				companyId: data.unit.companyId,
				blockName: data.unit.blockName,
				unitNo: data.unit.unitNo,
				unitName: data.unit.unitName,
				unitCategoryId: data.unit.unitCategoryId,
				unitTypeId: data.unit.unitTypeId,
				lt: data.unit.lt,
				lb: data.unit.lb,
				floor: data.unit.floor || 1,
				bedRoom: data.unit.bedRoom || 1,
				bathRoom: data.unit.bathRoom || 1,
				carPort: data.unit.carPort || 1,
				salesStatusId: data.unit.salesStatusId,
				progressStatusId: data.unit.progressStatusId,
				cashPrice: data.unit.cashPrice,
				isHoek: data.unit.isHoek,
				isShowUnit: data.unit.isShowUnit,
				isInhabited: data.unit.isInhabited,
				isOpen: data.unit.isOpen,
				// lastModifiedDate: data.unit.lastModifiedDate,
				// lastModifiedUser: data.unit.lastModifiedUser
			});

			this.companies = data.companies;
			this.projects = data.projects;

			this.unitCategories = data.unitCategories;
			this.unitTypes = data.unitTypes;

			this.salesStatuses = data.salesStatuses;
			this.progressStatuses = data.progressStatuses;

			this.paymentPlans = data.paymentPlans;
			this.dataSource.data = data.prices;
			this.dataSource.filterPredicate = this.customFilter();
			this.dataSource.filter = '1';

			this.isReadOnly = data.unit.salesStatusId === 3;
			this.isInitialized = true;
		});
	}

	customFilter() {
		const _filter = (data: Price, filter: string): boolean => {
			return !data.isDeleted && +data.progressStatusId === +this.progressStatusId.value;
			// console.log('data', data);
			// return +data.progressStatusId === +this.progressStatusId.value;
		};

		return _filter;
	}

	companyChanged(value) {
		this.projectId.setValue(null);
	}

	progressStatusChanged(value) {
		this.dataSource.filter = value;
	}

	get companyName() {
		return this.companies.find((c: Company) => +c.companyId === +this.companyId.value).companyName;
	}

	get projectName() {
		if (this.projectId.invalid) {
			return '';
		}
		return this.projects.find((p: Project) => +p.projectId === +this.projectId.value).projectName;
	}

	get salesStatusName() {
		return this.salesStatuses.find((s: SalesStatus) => +s.salesStatusId === +this.salesStatusId.value).salesStatusName;
	}

	get unitCategoryName() {
		return this.unitCategories.find((u: UnitCategory) => +u.unitCategoryId === +this.unitCategoryId.value).unitCategoryName;
	}

	get unitTypeName() {
		return this.unitTypes.find((u: UnitType) => +u.unitTypeId === +this.unitTypeId.value).unitTypeName;
	}

	get progressStatusName() {
		return this.progressStatuses.find((p: ProgressStatus) => +p.progressStatusId === +this.progressStatusId.value).progressStatusName;
	}

	get isHoekName() {
		return this.isHoek.value === 'Y' ? 'Yes' : 'No';
	}

	get isInhabitedName() {
		return this.isInhabited.value === 'Y' ? 'Yes' : 'No';
	}

	get isOpenName() {
		return this.isOpen.value === 'Y' ? 'Yes' : 'No';
	}

	get isShowUnitName() {
		return this.isShowUnit.value === 'Y' ? 'Yes' : 'No';
	}

	get formattedSalesStatusName() {
		return this.salesStatusName.toLowerCase().replace(/ /g, '-');
	}

	get filteredProjects() {
		return this.projects.filter((p: Project) => +p.companyId === +this.companyId.value);
	}

	unitNameChanged() {
		this.unitName.setValue(this.blockName.value + ' ' + this.unitNo.value);
	}

	get filteredUnitTypes() {
		return this.unitTypes.filter((u: UnitType) => +u.projectId === +this.projectId.value);
	}

	get filteredPaymentPlans() {
		return this.paymentPlans.filter((p: PaymentPlan) => +p.projectId === +this.projectId.value);
	}

	priceChanged(row, price) {
		if (!row.isAdded) {
			row.isEdited = true;
		}
		row.price = price;
	}

	get includedPaymentPlans() {
		const excludedPaymentPlanIds = this.dataSource.data.filter((p: Price) => !p.isDeleted && +p.progressStatusId === +this.progressStatusId.value).map((p: Price) => p.paymentPlanId)
		return this.paymentPlans.filter((p: PaymentPlan) => !excludedPaymentPlanIds.includes(p.paymentPlanId));
	}

	get canAddPrice() {
		return this.includedPaymentPlans.length > 0;
	}

	addPrice() {

		this.dialog
			.open(PriceComponent, {
				width: '300px',
				data: {
					paymentPlans: this.includedPaymentPlans
				}
			})
			.afterClosed()
			.subscribe(result => {
				if (!result) {
					return;
				}
				const dataSource = this.dataSource.data;
				dataSource.push({
					paymentPlanId: result.paymentPlanId,
					progressStatusId: +this.progressStatusId.value,
					paymentPlanName: result.paymentPlanName,
					price: result.price,
					isAdded: true
				})
				this.dataSource.data = dataSource;
			})
	}

	deletePrice(row) {
		if (row.isAdded) {
			const dataSource = this.dataSource.data.filter((p: Price) => +p.unitPriceId === +row.unitPriceId);
			this.dataSource.data = dataSource;
			return;
		}
		console.log('delete');
		row.isDeleted = true;
		this.dataSource.filter = row.unitPriceId;
	}

	save() {

	}

	submit() {
		this.formSubmitAttempt = true;
		if (this.formGroup.invalid) {
			return;
		}

		const data = this.formGroup.value;
		data.addedPrices = this.dataSource.data.filter((p: Price) => p.isAdded);
		data.editedPrices = this.dataSource.data.filter((p: Price) => p.isEdited);
		data.deletedPrices = this.dataSource.data.filter((p: Price) => p.isDeleted);

		console.log(data);

		this.detailService.update(this.unitId, data).subscribe(result => {
			console.log(result);
			this.ngOnInit();
		})
	}

}
