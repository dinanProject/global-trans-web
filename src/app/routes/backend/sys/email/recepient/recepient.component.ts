import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Employee, RecepientService } from './recepient.service';

@Component({
	selector: 'app-recepient',
	templateUrl: './recepient.component.html',
	styleUrls: ['./recepient.component.scss']
})
export class RecepientComponent implements OnInit {

	displayedColumns = ['no', 'fullName'];
	dataSource: MatTableDataSource<Employee> = new MatTableDataSource();
	isInitialized: boolean;


	@ViewChild(MatSort, { static: true }) sort: MatSort;

	addedEmployees: number[] = [];

	constructor(
		private recepientService: RecepientService,
		private dialogRef: MatDialogRef<RecepientComponent>,
		@Inject(MAT_DIALOG_DATA) private data: { emailId: number, recepientTypeId: number, addedEmployees: any }
	) { }

	ngOnInit(): void {
		this.isInitialized = false;
		console.log('data', this.data);
		console.log('addedEmployees', this.data.addedEmployees);
		this.addedEmployees = this.data.addedEmployees;
		this.getEmployees();
	}

	applyFilter(e: Event) {
		this.dataSource.filter = (e.target as HTMLInputElement).value.trim().toLowerCase();
		if (this.dataSource.paginator) {
			this.dataSource.paginator.firstPage();
		}
	}

	getEmployees() {
		this.recepientService.getEmployees().subscribe((employees: Employee[]) => {
			console.log('employees', employees);
			const filteredEmployees = employees.filter((e: Employee) => !this.addedEmployees.includes(e.employeeId));
			this.dataSource.data = filteredEmployees;
			this.dataSource.sort = this.sort;
			this.isInitialized = true;
		});
	}

	selectEmployee(e, employee: Employee) {
		this.dialogRef.close(employee);
	}

	checkboxClick(e: MatCheckboxChange, employee: Employee) {
		employee.isChecked = e.checked;
	}

	save() {
		const checkedEmployees = this.dataSource.data.filter((e: Employee) => e.isChecked);
		if (checkedEmployees.length === 0) {
			return this.dialogRef.close(false);
		}

		this.recepientService.insertRecepient(this.data.emailId, this.data.recepientTypeId, checkedEmployees).subscribe(result => {
			this.dialogRef.close(true);
		})
	}
}
