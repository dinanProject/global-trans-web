import { formatDate } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AddService, SalesInhouseType, Team } from './add.service';
import { EmployeeComponent } from './employee/employee.component';
import { Employee } from './employee/employee.service';

@Component({
	selector: 'app-add',
	templateUrl: './add.component.html',
	styleUrls: ['./add.component.scss']
})
export class AddComponent implements OnInit {

	isInitialized: boolean;

	fullName: string;

	formGroup: FormGroup;
	employeeId: FormControl<number>;
	salesInhouseTypeId: FormControl<number>;
	teamId: FormControl<number>;
	activeDate: FormControl<Date>;

	salesInhouseTypes: SalesInhouseType[];
	teams: Team[];

	isSaving: boolean;
	formSubmitAttempt: boolean;

	constructor(
		private addService: AddService,
		private dialog: MatDialog,
		private dialogRef: MatDialogRef<AddComponent>,
		private formBuilder: FormBuilder,
		@Inject(MAT_DIALOG_DATA) private data: { existingSales: number[] }
	) { }

	ngOnInit(): void {
		this.isInitialized = false;
		this.formSubmitAttempt = false;
		this.employeeId = new FormControl(null, [Validators.required]);
		this.salesInhouseTypeId = new FormControl(1, [Validators.required]);
		this.teamId = new FormControl(null, [Validators.required]);
		this.activeDate = new FormControl(new Date(), [Validators.required]);

		this.formGroup = this.formBuilder.group({
			employeeId: this.employeeId,
			salesInhouseTypeId: this.salesInhouseTypeId,
			teamId: this.teamId,
			activeDate: this.activeDate,
		});

		this.getSalesInhouseTypes()
			.then(() => this.getTeams())
			.then(() => this.isInitialized = true);
	}

	getSalesInhouseTypes() {
		return this.addService.getSalesInhouseTypes()
			.toPromise()
			.then((salesInhouseTypes: SalesInhouseType[]) => {
				this.salesInhouseTypes = salesInhouseTypes;
				if (salesInhouseTypes) {
					this.salesInhouseTypeId.setValue(salesInhouseTypes[0].salesInhouseTypeId);
				}
			});
	}

	getTeams() {
		return this.addService.getTeams()
			.toPromise()
			.then((teams: Team[]) => {
				this.teams = teams;
			});
	}

	selectEmployee() {
		this.dialog
			.open(EmployeeComponent, {
				width: '400px',
				height: '581px',
				data: {
					existingSales: this.data.existingSales
				}
			})
			.afterClosed()
			.subscribe((employee: Employee) => {
				console.log(employee);
				if (employee) {
					this.employeeId.setValue(employee.employeeId);
					this.fullName = employee.fullName;
				}
			})
	}

	submit() {
		console.log('submit!');
		this.formSubmitAttempt = true;
		this.isSaving = true;

		if (this.formGroup.invalid) {
			this.isSaving = false;
			return;
		}

		const data = this.formGroup.value;
		data.activeDate = formatDate(data.activeDate, 'yyyy-MM-dd', 'en');
		this.addService.insert(data)
			.subscribe(result => {
				this.isSaving = false;
				this.dialogRef.close(true);
			}, err => {
				this.isSaving = false;
			});
	}
}
