import { Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { DetailComponent } from './detail/detail.component';
import { Company, Price, Project, SalesStatus, Unit, UnitService } from './unit.service';

export interface Filter {
	search: string;
	companyId: number;
	projectId: number;
	salesStatusId: number;
	isShowNoPriceUnits: boolean;
}

@Component({
	selector: 'app-unit',
	templateUrl: './unit.component.html',
	styleUrls: ['./unit.component.scss']
})
export class UnitComponent implements OnInit {

	isInitialized: boolean;
	isRowInitialized: boolean;
	isEditing: boolean;
	isShowNoPriceUnits: boolean;

	loadedUnits: Unit[] = [];
	dataSource: MatTableDataSource<Unit> = new MatTableDataSource();

	companies: Company[] = [];
	selectedCompany: Company;
	projects: Project[] = [];
	filteredProjects: Project[] = [];
	selectedProject: Project;

	salesStatuses: SalesStatus[];
	// priceColumns: string[] = [];

	filter: Filter = {
		search: '',
		companyId: 0,
		projectId: 0,
		salesStatusId: 0,
		isShowNoPriceUnits: false
	};

	@ViewChildren('gridRow') private gridRows: QueryList<ElementRef>;

	constructor(
		private unitService: UnitService,
		private dialog: MatDialog
	) { }

	ngOnInit(): void {
		this.isInitialized = false;
		this.getCompanies()
			.then(() => this.getProjects())
			.then(() => this.getSalesStatuses())
			.then(() => this.getUnits());
		// this.getUnits();
	}

	getCompanies() {
		return new Promise<void>((resolve, reject) => {
			this.unitService.getCompanies().subscribe((companies: Company[]) => {
				console.log('companies', companies);
				this.companies = companies;
				this.selectedCompany = this.companies[0];
				resolve();
			})
		})
	}

	companyChanged(companyId: number) {
		this.selectedCompany = this.companies.find((c: Company) => c.companyId === +companyId);
		this.filteredProjects = this.projects.filter((p: Project) => p.companyId === +companyId);
		this.selectedProject = this.filteredProjects[0];
		this.getUnits();
	}

	getProjects() {
		return new Promise<void>((resolve, reject) => {
			this.unitService.getProjects().subscribe((projects: Project[]) => {
				console.log('projects', projects);
				this.projects = projects;
				this.filteredProjects = this.projects.filter((p: Project) => p.companyId === this.selectedCompany.companyId);
				this.selectedProject = this.filteredProjects[0];
				resolve();
			})
		})
	}

	projectChanged(projectId: number) {
		this.selectedProject = this.filteredProjects.find((p: Project) => p.projectId === +projectId);
		this.getUnits();
	}

	getSalesStatuses() {
		return new Promise<void>((resolve, reject) => {
			this.unitService.getSalesStatuses().subscribe((salesStatuses: SalesStatus[]) => {
				this.salesStatuses = salesStatuses;
				this.isInitialized = true;
				resolve();
			})
		})
	}

	getUnits() {
		this.isRowInitialized = false;
		this.unitService.getUnits(this.selectedCompany.companyId, this.selectedProject.projectId).subscribe((units: Unit[]) => {
			console.log('units', units);
			const unit = units[0];
			this.loadedUnits = JSON.parse(JSON.stringify(units));
			// this.priceColumns = [];
			// for (const p of unit.prices) {
			// 	this.priceColumns.push(p.paymentPlanName);
			// }
			this.dataSource.data = units;
			this.dataSource.filterPredicate = this.customFilter();
			this.dataSource.filter = JSON.stringify(this.filter);

			if (units.length === 0) {
				this.isRowInitialized = true;
			}

			this.gridRows.changes.subscribe(result => {
				setTimeout(() => {
					this.isRowInitialized = true;
				})
			})
		})
	}

	priceChanged(p: Price, price: string) {
		const amount: number = +price.replace(/\./g, '');
		p.price = amount;
	}

	noPriceUnitsChanged(e: MatCheckboxChange) {
		this.isRowInitialized = false;
		setTimeout(() => {
			this.isShowNoPriceUnits = e.checked;
			this.filter.isShowNoPriceUnits = e.checked;
			this.dataSource.filter = JSON.stringify(this.filter);
			this.gridRows.changes.subscribe(result => {
				setTimeout(() => {
					this.isRowInitialized = true;
				})
			})
		})
	}

	searchChanged(value: string) {
		const search = value.trim().toLowerCase();
		this.filter.search = search;
		this.dataSource.filter = JSON.stringify(this.filter);
	}

	salesStatusChanged(value: number) {
		this.isRowInitialized = false;
		setTimeout(() => {
			this.filter.salesStatusId = value;
			this.dataSource.filter = JSON.stringify(this.filter);
			this.gridRows.changes.subscribe(result => {
				setTimeout(() => {
					this.isRowInitialized = true;
				})
			})
		})
	}

	customFilter() {
		const _filter = (data: Unit, filter: string): boolean => {
			const parsedFilter = JSON.parse(filter);
			return (parsedFilter.search ?
				(data.companyName.toLowerCase().trim().indexOf(parsedFilter.search.toLowerCase().trim()) !== -1) ||
				(data.projectName.toLowerCase().trim().indexOf(parsedFilter.search.toLowerCase().trim()) !== -1) ||
				(data.unitName.toLowerCase().trim().indexOf(parsedFilter.search.toLowerCase().trim()) !== -1) ||
				(data.salesStatusName.toLowerCase().trim().indexOf(parsedFilter.search.toLowerCase().trim()) !== -1) ||
				(data.progressStatusName.toLowerCase().trim().indexOf(parsedFilter.search.toLowerCase().trim()) !== -1) ||
				((+data.lt || 0) === +parsedFilter.search) ||
				((+data.lb || 0) === +parsedFilter.search)
				: true) &&
				(+parsedFilter.companyId === 0 ? true : (+data.companyId === +parsedFilter.companyId)) &&
				(+parsedFilter.salesStatusId === 0 ? true : (+data.salesStatusId === +parsedFilter.salesStatusId)) &&
				(+parsedFilter.projectId === 0 ? true : (+data.projectId === +parsedFilter.projectId)) &&
				(+parsedFilter.isShowNoPriceUnits ? true : data.isUnitHasPrice);
		};

		return _filter;
	}

	edit() {
		this.isRowInitialized = false;
		setTimeout(() => {
			this.isEditing = true;
			this.isRowInitialized = true;
		})
	}

	editUnit(unitId: number) {
		this.dialog
			.open(DetailComponent, {
				width: '600px',
				// height: '700px',
				data: {
					unitId
				}
			})
			.afterClosed()
			.subscribe((result) => {

			});
	}

	save() {
		this.isRowInitialized = false;
		setTimeout(() => {
			this.isEditing = false;
			const updatedUnits = [];
			const editedPrice = [];
			const addedPrice = [];
			for (const u of this.loadedUnits) {
				const unit: Unit = this.dataSource.data.find((un: Unit) => u.unitId === un.unitId);
				if (+unit.lt !== +u.lt || +unit.lb !== +u.lb) {
					updatedUnits.push({
						unitId: unit.unitId,
						lt: unit.lt,
						lb: unit.lb
					})
				}

				for (let i = 0; i < u.prices.length; i++) {
					if (+u.prices[i].price !== +unit.prices[i].price) {
						if (u.prices[i].unitPriceId) {
							editedPrice.push(unit.prices[i]);
						} else {
							addedPrice.push(unit.prices[i]);
						}
					}
				}
			}

			this.unitService.save(updatedUnits, addedPrice, editedPrice).subscribe(result => {
				this.isRowInitialized = true;
			});
		})
	}
}
