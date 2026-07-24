import { formatDate } from '@angular/common';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { UtilityService } from 'src/app/services/utility.service';
import { LeadPropertyAgentComponent } from './lead-property-agent/lead-property-agent.component';
import { Company, DetailService, PaymentPlan, Project, ProjectType, LeadPropertyAgent, Unit, UnitType } from './detail.service';
import { PaymentPlanComponent } from './payment-plan/payment-plan.component';
import { UnitComponent } from './unit/unit.component';

export interface Filter {
	unitName: string;
	unitCategoryName: string;
	unitTypeName: string;
	salesStatusName: string;
	progressStatusName: string;
}

export interface QueryParams {
	'unit-name': string;
}
@Component({
	selector: 'app-detail',
	templateUrl: './detail.component.html',
	styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {

	projectId: number;
	projectTypes: Array<ProjectType> = [];
	companies: Array<Company> = [];

	logoPath: any;
	siteplanPath: any;

	formGroup: UntypedFormGroup;
	projectName: UntypedFormControl;
	city: UntypedFormControl;
	remark: UntypedFormControl;
	projectTypeId: UntypedFormControl;
	companyId: UntypedFormControl;
	launchingDate: UntypedFormControl;

	isInitialized: boolean;
	isUnitInitialized: boolean;
	isLogoUpload: boolean;
	isSiteplanUpload: boolean;
	formSubmitAttempt: boolean;

	paymentPlans: MatTableDataSource<PaymentPlan> = new MatTableDataSource();
	paymentPlansColumns = ['no', 'paymentMethodName', 'paymentPlanName', 'remark', 'actions'];

	unitTypes: MatTableDataSource<UnitType> = new MatTableDataSource();
	unitTypesColumns = ['no', 'unitTypeName', 'remark', 'unitCount', 'actions'];

	leadPropertyAgents: MatTableDataSource<LeadPropertyAgent> = new MatTableDataSource();
	leadPropertyAgentsColumns = ['no', 'propertyAgentName', 'startDate', 'endDate', 'status', 'actions'];

	units: MatTableDataSource<Unit> = new MatTableDataSource();
	unitsColumns = [
		'no',
		'unitName',
		'lt',
		'lb',
		'unitCategoryName',
		'unitTypeName',
		'salesStatusName',
		'progressStatusName',
		'cashPrice',
		'actions'
	];
	@ViewChild('unitPaginator') private unitPaginator: MatPaginator;
	@ViewChild('unitSort') private unitSort: MatSort;

	queryParams: QueryParams = {
		'unit-name': ''
	}

	filter: Filter = {
		unitName: '',
		unitCategoryName: 'All',
		unitTypeName: 'All',
		salesStatusName: 'All',
		progressStatusName: 'All'
	};

	constructor(
		private formBuilder: UntypedFormBuilder,
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private detailService: DetailService,
		private dialog: MatDialog,
		private utilityService: UtilityService
	) { }

	ngOnInit(): void {
		this.isInitialized = false;
		this.isUnitInitialized = false;
		this.isSiteplanUpload = false;
		const projectId = this.activatedRoute.snapshot.paramMap.get('projectId');
		if (projectId !== 'add') {
			this.projectId = +projectId;
		}

		const unit = this.activatedRoute.snapshot.queryParamMap.get('unit-name');
		this.queryParams['unit-name'] = unit;
		this.filter.unitName = unit || '';

		this.initForm()
		this.getProjectTypes()
			.then(() => this.getCompanies())
			.then(() => {
				if (!this.projectId) {
					this.isInitialized = true;
					return
				}
				return this.getProject()
					.then(() => {
						this.isInitialized = true;
					})
					.then(() => this.getPaymentPlans())
					.then(() => this.getUnitTypes())
					.then(() => this.getLeadPropertyAgents())
					.then(() => this.getUnits());
			})
	}

	initForm() {
		this.projectName = new UntypedFormControl('', [Validators.required]);
		this.city = new UntypedFormControl('');
		this.remark = new UntypedFormControl('');
		this.projectTypeId = new UntypedFormControl(1);
		this.companyId = new UntypedFormControl(null, [Validators.required]);
		this.launchingDate = new UntypedFormControl(new Date(), [Validators.required]);

		this.formGroup = this.formBuilder.group({
			projectName: this.projectName,
			city: this.city,
			remark: this.remark,
			projectTypeId: this.projectTypeId,
			companyId: this.companyId,
			launchingDate: this.launchingDate
		});
	}

	updateUrl() {
		this.router.navigate([], {
			queryParams: this.queryParams,
			queryParamsHandling: 'merge',
			replaceUrl: true,
		});
	}

	getCompanies() {
		return this.detailService.getCompanies()
			.toPromise()
			.then((companies: Array<Company>) => {
				console.log('companies', companies);
				this.companies = companies;
			})
	}

	getProjectTypes() {
		return this.detailService.getProjectTypes()
			.toPromise()
			.then((projectTypes: Array<ProjectType>) => {
				console.log('projectTypes', projectTypes);
				this.projectTypes = projectTypes;
			})
	}

	getProject() {
		return this.detailService.getProject(this.projectId)
			.toPromise()
			.then((project: Project) => {
				this.formGroup.setValue({
					projectName: project.projectName,
					city: project.city,
					remark: project.remark,
					projectTypeId: project.projectTypeId,
					companyId: project.companyId,
					launchingDate: project.launchingDate
				})
				this.logoPath = project.logoPath;
				this.siteplanPath = project.siteplanPath;
			})
	}

	get companyName() {
		if (!this.companyId.value) {
			return '';
		}
		return this.companies.find((c: Company) => +c.companyId === +this.companyId.value).companyName;
	}

	uploadLogoChanged(e) {
		const file: File = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];
		if (file) {
			this.convertImageToBase64(file)
				.then((base64Image) => {
					this.isLogoUpload = true;
					this.logoPath = base64Image;
					e.target.value = '';
				});
		}
	}

	uploadSiteplanChanged(e) {
		const file: File = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];
		if (file) {
			this.convertImageToBase64(file)
				.then((base64Image) => {
					this.isSiteplanUpload = true;
					this.siteplanPath = base64Image;
					e.target.value = '';
				});
		}
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

	save() {
		this.formSubmitAttempt = true;
		if (this.formGroup.invalid) {
			return;
		}
		const data = this.formGroup.value;
		data.launchingDate = formatDate(data.launchingDate, 'yyyy-MM-dd', 'en');

		const formData = new FormData();
		formData.append('data', JSON.stringify(data));

		if (this.isLogoUpload) {
			console.log('isLogoUpload');
			const logoImage = this.dataURItoBlob(this.logoPath);
			formData.append('logo', logoImage, 'logo.jpg');
		}

		if (this.isSiteplanUpload) {
			console.log('isSiteplanUpload');
			const mapImage = this.dataURItoBlob(this.siteplanPath);
			formData.append('siteplan', mapImage, 'siteplan.jpg');
		}

		if (this.projectId) {
			console.log(formData);
			this.detailService.updateProject(this.projectId, formData).subscribe(() => {
				// this.dialogRef.close(true);
				this.ngOnInit();
			})
		} else {
			this.detailService.insertProject(formData).subscribe(() => {
				// this.dialogRef.close(true);
				this.ngOnInit();
			})
		}
	}

	getPaymentPlans() {
		return this.detailService.getPaymentPlans(this.projectId)
			.toPromise()
			.then((paymentPlans: PaymentPlan[]) => {
				this.paymentPlans.data = paymentPlans;
			})
	}

	paymentPlanSearchChanged(value: string) {
		this.paymentPlans.filter = value.toLowerCase().trim();
	}

	addPaymentPlan() {
		this.dialog
			.open(PaymentPlanComponent, {
				width: '600px',
				height: '502px',
				data: {
					projectId: this.projectId
				}
			})
			.afterClosed()
			.subscribe(result => {
				if (!result) {
					return;
				}
			})
	}

	editPaymentPlan(paymentPlanId: number) {
		this.dialog
			.open(PaymentPlanComponent, {
				width: '600px',
				height: '502px',
				data: {
					projectId: this.projectId,
					paymentPlanId
				}
			})
			.afterClosed()
			.subscribe(result => {
				if (!result) {
					return;
				}

				this.ngOnInit();
			})
	}

	deletePaymentPlan(paymentPlanId: number) {
		if (!confirm('Delete current data?')) {
			return;
		}

		this.detailService.deletePaymentPlan(this.projectId, paymentPlanId).subscribe(result => {
			this.ngOnInit();
		});
	}

	getUnitTypes() {
		return this.detailService.getUnitTypes(this.projectId)
			.toPromise()
			.then((unitTypes: UnitType[]) => {
				this.unitTypes.data = unitTypes;
			})
	}

	unitTpyeSearchChanged(value: string) {
		this.unitTypes.filter = value.toLowerCase().trim();
	}

	getUnits() {
		this.isUnitInitialized = false;
		this.detailService.getUnits(this.projectId).subscribe((data: { units: Unit[] }) => {
			this.units.data = data.units;
			this.units.paginator = this.unitPaginator;
			this.units.filterPredicate = this.customFilter();
			this.units.filter = JSON.stringify(this.filter);
			this.isUnitInitialized = true;
			setTimeout(() => {
				this.units.sort = this.unitSort;
			});
		});
	}

	onlyUnique(value, index, self) {
		return self.indexOf(value) === index;
	}

	get unitCategoryNames() {
		return this.units.data.map((u: Unit) => u.unitCategoryName).filter(this.onlyUnique);
	}

	get unitTypeNames() {
		return this.units.data.map((u: Unit) => u.unitTypeName).filter(this.onlyUnique);
	}

	get salesStatusNames() {
		return this.units.data.map((u: Unit) => u.salesStatusName).filter(this.onlyUnique);
	}

	get progressStatusNames() {
		return this.units.data.map((u: Unit) => u.progressStatusName).filter(this.onlyUnique);
	}

	customFilter() {
		const _filter = (data: Unit, filter: string): boolean => {
			const parsedFilter = JSON.parse(filter);

			return (parsedFilter.unitName === '' ? true : (data.unitName.toLowerCase().trim().indexOf(parsedFilter.unitName.toLowerCase().trim()) !== -1)) &&
				(parsedFilter.unitCategoryName === 'All' ? true : (data.unitCategoryName === parsedFilter.unitCategoryName)) &&
				(parsedFilter.unitTypeName === 'All' ? true : (data.unitTypeName === parsedFilter.unitTypeName)) &&
				(parsedFilter.salesStatusName === 'All' ? true : (data.salesStatusName === parsedFilter.salesStatusName)) &&
				(parsedFilter.progressStatusName === 'All' ? true : (data.progressStatusName === parsedFilter.progressStatusName));
		};

		return _filter;
	}

	searchChanged(e: Event) {
		const search = (e.target as HTMLInputElement).value.trim().toLowerCase();
		this.filter.unitName = search;
		this.units.filter = JSON.stringify(this.filter);
		this.queryParams['unit-name'] = search;
		this.updateUrl();
	}

	unitCategoryChanged(e: Event) {
		this.filter.unitCategoryName = (e.target as HTMLSelectElement).value;
		this.units.filter = JSON.stringify(this.filter);
	}

	unitTypeChanged(e: Event) {
		this.filter.unitTypeName = (e.target as HTMLSelectElement).value;
		this.units.filter = JSON.stringify(this.filter);
	}

	salesStatusChanged(e: Event) {
		this.filter.salesStatusName = (e.target as HTMLSelectElement).value;
		this.units.filter = JSON.stringify(this.filter);
	}

	progressStatusChanged(e: Event) {
		this.filter.progressStatusName = (e.target as HTMLSelectElement).value;
		this.units.filter = JSON.stringify(this.filter);
	}

	addUnit() {
		this.dialog
			.open(UnitComponent, {
				width: '1000px',
				height: '644px',
				data: {
					projectId: this.projectId
				}
			})
			.afterClosed()
			.subscribe(result => {
				if (result) {
					this.getUnits();
				}
			});
	}

	editUnit(unitId: number) {
		this.dialog
			.open(UnitComponent, {
				width: '1000px',
				height: '644px',
				data: {
					projectId: this.projectId,
					unitId
				}
			})
			.afterClosed()
			.subscribe(result => {
				if (result) {
					this.getUnits();
				}
			});
	}

	getLeadPropertyAgents() {
		return this.detailService.getLeadPropertyAgents(this.projectId)
			.toPromise()
			.then((propertyAgents: LeadPropertyAgent[]) => {
				this.leadPropertyAgents.data = propertyAgents;
			})
	}

	leadPropertyAgentSearchChanged(value: string) {
		this.leadPropertyAgents.filter = value.toLowerCase().trim();
	}

	addLeadPropertyAgent() {
		this.dialog
			.open(LeadPropertyAgentComponent, {
				width: '340px',
				data: {
					projectId: this.projectId,
				}
			})
			.afterClosed()
			.subscribe(result => {
				this.getLeadPropertyAgents();
			});
	}

	editLeadPropertyAgent(projectLeadPropertyAgentId: number) {
		this.dialog
			.open(LeadPropertyAgentComponent, {
				width: '340px',
				data: {
					projectId: this.projectId,
					projectLeadPropertyAgentId
				}
			})
			.afterClosed()
			.subscribe(result => {
				this.getLeadPropertyAgents();
			});
	}

	deleteLeadPropertyAgent(projectLeadPropertyAgentId: number) {
		if (!confirm('Delete current Lead Agent?')) {
			return;
		}

		this.detailService.deleteLeadPropertyAgent(this.projectId, projectLeadPropertyAgentId)
			.subscribe(result => {
				this.getLeadPropertyAgents();
			})
	}
}
