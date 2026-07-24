import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Employee, EmployeeService } from './employee.service';

@Component({
	selector: 'app-employee',
	templateUrl: './employee.component.html',
	styleUrls: ['./employee.component.scss']
})
export class EmployeeComponent implements OnInit {

	isInitialized: boolean;
	dataSource: MatTableDataSource<Employee> = new MatTableDataSource();
	displayedColumns = ['no', 'fullName', 'actions'];

	constructor(
		private employeeService: EmployeeService,
		private dialogRef: MatDialogRef<EmployeeComponent>,
		@Inject(MAT_DIALOG_DATA) private data: { existingSales: number[] }
	) { }

	ngOnInit(): void {
		this.isInitialized = false;
		this.getUsers();
	}

	getUsers() {
		return this.employeeService.getEmployees()
			.toPromise()
			.then((employees: Employee[]) => {
				this.dataSource.data = employees
					.filter((e: Employee) => !this.data.existingSales.includes(e.employeeId))
					.map((e: Employee, i: number) => Object.assign(e, {
						no: i + 1
					}));
				this.isInitialized = true;
			})
	}

	searchChanged(value: string) {
		this.dataSource.filter = value.toLowerCase();
	}

	select(employee: Employee) {
		this.dialogRef.close(employee);
	}

}
