import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Employee, EmployeeService } from './employee.service';

export interface Filter {
	search: string;
	occupationName: string;
	departmentName: string;
	companyName: string;
}
@Component({
	selector: 'app-employee',
	templateUrl: './employee.component.html',
	styleUrls: ['./employee.component.scss']
})
export class EmployeeComponent implements OnInit {

	isInitialized: boolean;

	dataSource: MatTableDataSource<Employee> = new MatTableDataSource();
	displayedColumns = ['no', 'employeeCode', 'fullName', 'occupationName', 'departmentName', 'companyName', 'actions'];
	@ViewChild(MatPaginator) paginator: MatPaginator;

	filter: Filter = {
		search: '',
		occupationName: 'All',
		departmentName: 'All',
		companyName: 'All',
	}

	constructor(
		private employeeService: EmployeeService,
		private dialog: MatDialog
	) { }

	ngOnInit(): void {
		this.isInitialized = false;
		this.getEmployees();
	}

	getEmployees() {
		this.employeeService.getEmployees()
			.toPromise()
			.then((employees: Employee[]) => {
				console.log('employees', employees);
				this.dataSource.data = employees;
				this.dataSource.filterPredicate = this.customFilter();
				this.dataSource.paginator = this.paginator;
				this.isInitialized = true;
			});
	}

	onlyUnique(value, index, self) {
		return self.indexOf(value) === index;
	}

	customFilter() {
		const _filter = (data: Employee, filter: string): boolean => {
			const parsedFilter = JSON.parse(filter);
			return (parsedFilter.search ?
				(
					data.employeeCode.toLowerCase().trim().indexOf(parsedFilter.search.toLowerCase().trim()) !== -1 ||
					data.fullName.toLowerCase().trim().indexOf(parsedFilter.search.toLowerCase().trim()) !== -1
				)
				: true) &&
				(parsedFilter.occupationName === 'All' ? true : (data.occupationName === parsedFilter.occupationName)) &&
				(parsedFilter.departmentName === 'All' ? true : (data.departmentName === parsedFilter.departmentName)) &&
				(parsedFilter.companyName === 'All' ? true : (data.companyName === parsedFilter.companyName)
				)
		}

		return _filter;
	}

	searchChanged(e: Event) {
		this.filter.search = (e.target as HTMLInputElement).value;
		this.dataSource.filter = JSON.stringify(this.filter);
	}

	occupationChanged(e: Event) {
		this.filter.occupationName = (e.target as HTMLSelectElement).value;
		this.dataSource.filter = JSON.stringify(this.filter);
	}

	departmentChanged(e: Event) {
		this.filter.departmentName = (e.target as HTMLSelectElement).value;
		this.dataSource.filter = JSON.stringify(this.filter);
	}

	companyChanged(e: Event) {
		this.filter.companyName = (e.target as HTMLSelectElement).value;
		this.dataSource.filter = JSON.stringify(this.filter);
	}

	get occupationNames() {
		return this.dataSource.data.map((e: Employee) => e.occupationName).filter(this.onlyUnique);
	}

	get departmentNames() {
		return this.dataSource.data.map((e: Employee) => e.departmentName).filter(this.onlyUnique);
	}

	get companyNames() {
		return this.dataSource.data.map((e: Employee) => e.companyName).filter(this.onlyUnique);
	}

	employeeClick() {
		alert('OK');
	}

}
