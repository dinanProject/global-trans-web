import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { switchMap } from 'rxjs/operators';
import { UtilityService } from 'src/app/services/utility.service';
import { ChangeTeamComponent } from './change-team/change-team.component';
// import { DetailService, Sales, salesInhouseType, Team } from './detail.service';
import { DetailService, Sales, Team } from './detail.service';
import { EmployeeComponent } from './employee/employee.component';
import { Employee } from './employee/employee.service';

@Component({
	selector: 'app-detail',
	templateUrl: './detail.component.html',
	styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {

	isInitialized: boolean;
	isSalesInitialized: boolean;

	teamId: number;

	formGroup: FormGroup;
	teamName: FormControl<string>;
	// salesInhouseTypeId: FormControl<number>;
	supervisorId: FormControl<number>;
	smId: FormControl<number>;
	gmId: FormControl<number>;

	supervisorName: string;
	smName: string;
	gmName: string;

	// salesInhouseTypes: SalesInhouseType[];
	formSubmitAttempt: boolean;

	dataSource: MatTableDataSource<Sales> = new MatTableDataSource();
	displayedColumns = ['no', 'fullName', 'actions'];

	constructor(
		@Inject(MAT_DIALOG_DATA) private data: { teamId: number },
		private formBuilder: FormBuilder,
		private detailService: DetailService,
		private dialog: MatDialog,
		private dialogRef: MatDialogRef<DetailComponent>,
		private utilityService: UtilityService
	) { }

	ngOnInit(): void {
		this.isInitialized = false;
		this.isSalesInitialized = false;
		this.formSubmitAttempt = false;
		this.teamId = this.data.teamId;
		this.teamName = new FormControl(null, [Validators.required]);
		// this.salesInhouseTypeId = new FormControl(1);
		this.supervisorId = new FormControl(null);
		this.smId = new FormControl(null);
		this.gmId = new FormControl(null);

		this.formGroup = this.formBuilder.group({
			teamName: this.teamName,
			// salesInhouseTypeId: this.salesInhouseTypeId,
			supervisorId: this.supervisorId,
			smId: this.smId,
			gmId: this.gmId,
		})

		// this.getSalesInhouseTypes()
		// 	.then(() => {
		// 		if (!this.teamId) {
		// 			this.isInitialized = true;
		// 			return;
		// 		}

		// 		return this.getTeam()
		// 			.then(() => this.getTeamSales());

		// 	})
		// 	.then(() => this.isInitialized = true);

		if (!this.teamId) {
			this.isInitialized = true;
			return;
		}

		this.getTeam()
			.then(() => this.getTeamSales())
			.then(() => this.isInitialized = true);
	}

	// getSalesInhouseTypes() {
	// 	return this.detailService.getSalesInhouseTypes()
	// 		.toPromise()
	// 		.then((salesInhouseTypes: SalesInhouseType[]) => {
	// 			this.salesInhouseTypes = salesInhouseTypes;
	// 		})
	// }

	getTeam() {
		return this.detailService.getTeam(this.teamId)
			.toPromise()
			.then((team: Team) => {
				this.formGroup.setValue({
					teamName: team.teamName,
					// salesInhouseTypeId: team.salesInhouseTypeId,
					supervisorId: team.supervisorId,
					smId: team.smId,
					gmId: team.gmId,
				})

				this.supervisorName = team.supervisorName;
				this.smName = team.smName;
				this.gmName = team.gmName;
			})
	}

	getTeamSales() {
		return this.detailService.getTeamSales(this.teamId)
			.toPromise()
			.then((saleses: Sales[]) => {
				this.dataSource.data = saleses;
				this.isSalesInitialized = true;
			})
	}

	searchChanged(value: string) {
		this.dataSource.filter = value.toLowerCase().trim();
	}

	getSupervisor() {
		this.dialog
			.open(EmployeeComponent, {
				width: '400px',
				height: '581px',
				data: {}
			})
			.afterClosed()
			.subscribe((employee: Employee) => {
				if (employee) {
					this.supervisorId.setValue(employee.employeeId);
					this.supervisorName = employee.fullName;
				}
			});
	}

	getSM() {
		this.dialog
			.open(EmployeeComponent, {
				width: '400px',
				height: '581px',
				data: {}
			})
			.afterClosed()
			.subscribe((employee: Employee) => {
				if (employee) {
					this.smId.setValue(employee.employeeId);
					this.smName = employee.fullName;
				}
			});
	}

	getGM() {
		this.dialog
			.open(EmployeeComponent, {
				width: '400px',
				height: '581px',
				data: {}
			})
			.afterClosed()
			.subscribe((employee: Employee) => {
				if (employee) {
					this.gmId.setValue(employee.employeeId);
					this.gmName = employee.fullName;
				}
			});
	}

	addSales() {
		this.dialog
			.open(EmployeeComponent, {
				width: '400px',
				height: '581px',
				data: {
					excludedEmployees: this.dataSource.data.map((sales: Sales) => sales.employeeId)
				}
			})
			.afterClosed()
			.subscribe((result: Employee) => {
				if (result) {
					console.log('result', result);
					const saleses: Sales[] = this.dataSource.data;
					saleses.push({
						employeeId: result.employeeId,
						fullName: result.fullName,
						salesInhouseId: null
					});

					this.dataSource.data = saleses;
				}
			})
	}

	submit() {
		this.formSubmitAttempt = true;
		if (this.formGroup.invalid) {
			return;
		}

		const data = this.formGroup.value;
		data.saleses = this.dataSource.data;

		if (!this.teamId) {
			this.detailService.insertTeam(data)
				.subscribe(result => {
					this.dialogRef.close(true);
				})
		} else {
			this.detailService.updateTeam(this.teamId, data)
				.subscribe(result => {
					this.dialogRef.close(true);
				})
		}
	}

	deleteTeam() {
		// if (this.dataSource.data.length > 0) {
		// 	return this.utilityService.alert(
		// 		'Cannot Delete Team',
		// 		'You must move team member to other team before you can delete this team',
		// 		AlertType.danger
		// 	);
		// }

		this.utilityService.confirm('Delete Team', 'Are you sure you want to delete current team?')
			.then((result) => {
				console.log('confirm result', result);
				if (result) {

				}
			})
	}

	changeTeam(salesInhouseId: number) {
		this.dialog
			.open(ChangeTeamComponent, {
				width: '300px',
				data: {
					salesInhouseId,
					selectedTeamId: this.teamId
				}
			})
			.afterClosed()
			.subscribe(result => {
				if (result) {
					this.getTeamSales();
				}
			});
	}
}
