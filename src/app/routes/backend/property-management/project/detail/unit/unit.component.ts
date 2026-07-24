import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { SessionService } from 'src/app/services/session.service';
import { PriceComponent } from './price/price.component';
import { PaymentPlan, Price, ProgressStatus, Project, SalesStatus, Unit, UnitCategory, UnitService, UnitType } from './unit.service';

@Component({
	selector: 'app-unit',
	templateUrl: './unit.component.html',
	styleUrls: ['./unit.component.scss']
})
export class UnitComponent implements OnInit {

	projectId: number;
	unitId: number;

	projectName: string;
	companyName: string;

	unitCategories: UnitCategory[];
	unitTypes: UnitType[];
	salesStatuses: SalesStatus[];
	progressStatuses: ProgressStatus[];

	formGroup: UntypedFormGroup;
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
	displayedColumns = ['no', 'paymentPlanId', 'remark', 'price', 'actions'];

	// isReadOnly: boolean;
	isInitialized: boolean;
	formSubmitAttempt: boolean;

	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private unitService: UnitService,
		private formBuilder: UntypedFormBuilder,
		private dialog: MatDialog,
		private dialogRef: MatDialogRef<UnitComponent>,
		private sessionService: SessionService,
		@Inject(MAT_DIALOG_DATA) private data: { projectId: number, unitId: number }
	) { }

	ngOnInit(): void {
		// this.isReadOnly = false;
		this.isInitialized = false;
		this.formSubmitAttempt = false;
		// this.projectId = +this.activatedRoute.snapshot.paramMap.get('projectId');
		this.projectId = this.data.projectId;
		// const unitId = this.activatedRoute.snapshot.paramMap.get('unitId');
		const unitId = this.data.unitId;
		// if (unitId !== 'new') {
		// 	this.unitId = +unitId;
		// }
		if (unitId) {
			this.unitId = +unitId;
		}
		this.initForm();
		this.getUnitCategories()
			.then(() => this.getUnitTypes())
			.then(() => this.getSalesStatuses())
			.then(() => this.getProgressStatuses())
			.then(() => this.getPaymentPlans())
			.then(() => this.getUnit())
	}

	initForm() {
		this.blockName = new UntypedFormControl('', [Validators.required]);
		this.unitNo = new UntypedFormControl('', [Validators.required]);
		this.unitName = new UntypedFormControl('', [Validators.required]);
		this.unitCategoryId = new UntypedFormControl(1);
		this.unitTypeId = new UntypedFormControl(1);
		this.lt = new UntypedFormControl(0, [Validators.required]);
		this.lb = new UntypedFormControl(0, [Validators.required]);
		this.floor = new UntypedFormControl(0, [Validators.required]);
		this.bedRoom = new UntypedFormControl(0, [Validators.required]);
		this.bathRoom = new UntypedFormControl(0, [Validators.required]);
		this.carPort = new UntypedFormControl(0, [Validators.required]);
		this.salesStatusId = new UntypedFormControl(1);
		this.progressStatusId = new UntypedFormControl(1);
		this.cashPrice = new UntypedFormControl(0, [Validators.min(1)]);
		this.isHoek = new UntypedFormControl('N');
		this.isShowUnit = new UntypedFormControl('N');
		this.isInhabited = new UntypedFormControl('N');
		this.isOpen = new UntypedFormControl('N');

		this.formGroup = this.formBuilder.group({
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
			isOpen: this.isOpen
		});
	}

	getUnit() {
		this.dataSource.filterPredicate = this.customFilter();

		if (!this.unitId) {
			return this.unitService.getProject(this.projectId).toPromise().then((project: Project) => {
				console.log('project', project);
				this.companyName = project.companyName;
				this.projectName = project.projectName;
				this.isInitialized = true;
			});
		}

		return this.unitService.getUnit(this.projectId, this.unitId)
			.toPromise()
			.then((data: {
				unit: Unit,
				prices: Price[]
			}) => {
				console.log('getUnit', data);
				this.formGroup.setValue({
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
					salesStatusId: data.unit.salesStatusId || 1,
					progressStatusId: data.unit.progressStatusId || 1,
					cashPrice: data.unit.cashPrice,
					isHoek: data.unit.isHoek,
					isShowUnit: data.unit.isShowUnit,
					isInhabited: data.unit.isInhabited,
					isOpen: data.unit.isOpen
				});

				this.projectName = data.unit.projectName;
				this.companyName = data.unit.companyName;

				this.dataSource.data = data.prices;
				this.dataSource.filter = '1';

				// this.isReadOnly = data.unit.salesStatusId === 3;
				this.isInitialized = true;
			});
	}

	get isReadOnly() {
		if (this.sessionService.hasMn('web.backend.property-management.project.unit.edit-sold-and-reserved-unit')) {
			return false;
		}
		return this.salesStatusId.value === 3;
	}

	getUnitCategories() {
		return this.unitService.getUnitCategories(this.projectId)
			.toPromise()
			.then((unitCategories: UnitCategory[]) => {
				console.log('getUnitCategories', unitCategories);
				this.unitCategories = unitCategories;
			});
	}

	getUnitTypes() {
		return this.unitService.getUnitTypes(this.projectId)
			.toPromise()
			.then((unitTypes: UnitType[]) => {
				console.log('getUnitTypes', unitTypes);
				this.unitTypes = unitTypes;
			})
	}

	getSalesStatuses() {
		return this.unitService.getSalesStatuses(this.projectId)
			.toPromise()
			.then((salesStatuses: SalesStatus[]) => {
				console.log('getSalesStatuses', salesStatuses);
				this.salesStatuses = salesStatuses;
			})
	}

	getProgressStatuses() {
		return this.unitService.getProgressStatuses(this.projectId)
			.toPromise()
			.then((progressStatuses: ProgressStatus[]) => {
				console.log('getProgressStatuses', progressStatuses);
				this.progressStatuses = progressStatuses;
			})
	}

	getPaymentPlans() {
		return this.unitService.getPaymentPlans(this.projectId)
			.toPromise()
			.then((paymentPlans: PaymentPlan[]) => {
				console.log('getProgressStatuses', paymentPlans);
				this.paymentPlans = paymentPlans;
			})
	}

	customFilter() {
		const _filter = (data: Price, filter: string): boolean => {
			return !data.isDeleted && +data.progressStatusId === +this.progressStatusId.value;
			// console.log('data', data);
			// return +data.progressStatusId === +this.progressStatusId.value;
		};

		return _filter;
	}

	progressStatusChanged(e: Event) {
		this.dataSource.filter = (e.target as HTMLSelectElement).value;
	}

	get salesStatusName() {
		return this.salesStatuses.find((s: SalesStatus) => +s.salesStatusId === +this.salesStatusId.value).salesStatusName;
	}

	get unitCategoryName() {
		return this.unitCategories.find((u: UnitCategory) => +u.unitCategoryId === +this.unitCategoryId.value).unitCategoryName;
	}

	get unitTypeName() {
		if (!this.unitTypeId.value) {
			return '';
		}
		return this.unitTypes.find((u: UnitType) => +u.unitTypeId === +this.unitTypeId.value).unitTypeName;
	}

	get progressStatusName() {
		if (!this.progressStatusId.value) {
			return '';
		}
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

	unitNameChanged() {
		this.unitName.setValue(this.blockName.value + ' ' + this.unitNo.value);
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
					remark: result.remark,
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

		if (!this.unitId) {
			this.unitService.insert(this.projectId, data).subscribe(result => {
				console.log(result)
				// this.router.navigate(['../' + result], {
				// 	relativeTo: this.activatedRoute,
				// 	replaceUrl: true
				// });
				this.dialogRef.close(true);
			})
		} else {
			this.unitService.update(this.projectId, this.unitId, data).subscribe(result => {
				console.log(result);
				// this.ngOnInit();
				this.dialogRef.close(true);
			})
		}
	}

}
