import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Company } from './company.component';
import { DepartmentAndOccupationService } from './department-and-occupation.service';
import { Department } from './department.component';
import { DetailComponent, DialogAction, DialogData, DialogType } from './detail/detail.component';

// export interface Company {
// 	companyId: number;
// 	companyName: string;
// }

// export interface Department {
// 	departmentId: number;
// 	departmentName: string;
// 	departmentTypeId: number;
// 	parentId: number;
// 	parentName: string;
// 	sequence: number;
// 	remark: string;
// 	occupations: Occupation[];
// 	departments: Department[];
// }

// export interface Occupation {
// 	occupationId: number;
// 	occupationName: string;
// 	departmentId: number;
// }

export interface Data {
	companyId: number;
	companyName: string;
	remark: string;
	departments: Department[];
}

export interface EventData {
	id: number;
	name: string;
}

@Component({
	selector: 'app-department-and-occupation',
	templateUrl: './department-and-occupation.component.html',
	styleUrls: ['./department-and-occupation.component.scss']
})
export class DepartmentAndOccupationComponent implements OnInit {

	companies: Company[] = [];
	selectedCompany: Company;
	datas: Data[] = [];
	selectedData: Data;

	isDataInitialized: boolean;
	isCompanyInitialized: boolean;

	constructor(
		private departmentAndOccupationService: DepartmentAndOccupationService,
		private dialog: MatDialog
	) { }

	ngOnInit(): void {
		this.getCompanies()
			.then(() => this.getDepartmentsAndOccupations());
	}

	companyChanged(e: Event) {
		// this.selectedCompany = this.companies.find((c: Company) => +c.companyId === +companyId);
		// this.getDepartmentsAndOccupations();
	}

	searchChanged(e: Event) {

	}

	getCompanies() {
		this.isCompanyInitialized = false;
		return new Promise<void>((resolve, reject) => {
			this.departmentAndOccupationService.getCompanies().subscribe((companies: Company[]) => {
				console.log('companies', companies);
				this.companies = companies;
				this.isCompanyInitialized = true;
				resolve();
			})
		});
	}

	getDepartmentsAndOccupations() {
		this.isDataInitialized = false;
		this.departmentAndOccupationService.getDepartmentsAndOccupations().subscribe((datas: Data[]) => {
			console.log('datas', datas);
			this.datas = datas;
			this.isDataInitialized = true;
		})
	}

	addDepartment(departmentId?: number) {
		this.dialog
			.open(DetailComponent, {
				width: '300px',
				height: '400px',
				data: {
					departmentId,
					type: 'department'
				}
			})
			.afterClosed()
			.subscribe(result => {
				if (result) {
					this.getDepartmentsAndOccupations();
				}
			})
	}

	editDepartment(departmentId: number) {
		console.log('editDepartment', departmentId);
	}

	deleteDepartment(departmentId: number) {
		console.log('deleteDepartment', departmentId);
	}


	addOccupation(occupationId: number) {
		console.log('addOccupation', occupationId);
	}

	editOccupation(occupationId: number) {
		console.log('editOccupation', occupationId);
	}

	deleteOccupation(occupationId: number) {
		console.log('deleteOccupation', occupationId);
	}

	companyAdded(data: EventData) {
		this.dialog
			.open<DetailComponent, DialogData>(DetailComponent, {
				width: '360px',
				height: '400px',
				data: {
					dialogAction: DialogAction.Add,
					dialogType: DialogType.Company,
					id: data.id,
					name: data.name
				}
			})
			.afterClosed()
			.subscribe(result => {
				if (result) {
					console.log(result);
					this.ngOnInit();
				}
			})
	}

	companyEdited(data: EventData) {
		this.dialog
			.open<DetailComponent, DialogData>(DetailComponent, {
				width: '300px',
				height: '400px',
				data: {
					dialogAction: DialogAction.Edit,
					dialogType: DialogType.Company,
					id: data.id,
					name: data.name
				}
			})
			.afterClosed()
			.subscribe(result => {
				if (result) {
					console.log(result);
					this.ngOnInit();
				}
			})
	}

	companyDeleted(data: EventData) {
		if (!confirm('Delete current company ?')) {
			return;
		}

		this.departmentAndOccupationService.deleteCompany(data.id).subscribe(result => {
			this.ngOnInit();
		})
	}

	departmentAdded(data: EventData) {
		this.dialog
			.open<DetailComponent, DialogData>(DetailComponent, {
				width: '300px',
				height: '400px',
				data: {
					dialogAction: DialogAction.Add,
					dialogType: DialogType.Department,
					id: data.id,
					name: data.name
				}
			})
			.afterClosed()
			.subscribe(result => {
				if (result) {
					this.ngOnInit();
				}
			})
	}

	departmentEdited(data: EventData) {
		console.log('departmentEdited', data);
	}

	departmentDeleted(data: EventData) {
		console.log('departmentDeleted', data);
	}

	occupationAdded(data: EventData) {
		this.dialog
			.open<DetailComponent, DialogData>(DetailComponent, {
				width: '300px',
				height: '400px',
				data: {
					dialogAction: DialogAction.Add,
					dialogType: DialogType.Occupation,
					id: data.id,
					name: data.name
				}
			})
			.afterClosed()
			.subscribe(result => {
				if (result) {
					this.ngOnInit();
				}
			})
	}

	occupationEdited(data: EventData) {
		console.log('occupationEdited', data);
	}

	occupationDeleted(data: EventData) {
		console.log('occupationDeleted', data);
	}
}
