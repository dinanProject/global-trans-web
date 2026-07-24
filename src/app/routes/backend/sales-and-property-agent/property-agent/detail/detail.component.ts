import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { UtilityService } from 'src/app/services/utility.service';
import { DetailService, Employee, PropertyAgent, SalesAgent } from './detail.service';
import { SalesAgentComponent } from './sales-agent/sales-agent.component';

@Component({
	selector: 'app-detail',
	templateUrl: './detail.component.html',
	styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {

	isInitialized: boolean;
	formSubmitAttempt: boolean;

	propertyAgentId: number;

	formGroup: FormGroup;

	propertyAgentCode: FormControl<string>;
	propertyAgentName: FormControl<string>;
	remark: FormControl<string>;
	companyName: FormControl<string>;
	ownerName: FormControl<string>;

	area: FormControl<string>;
	address: FormControl<string>;
	phone: FormControl<string>;
	fax: FormControl<string>;
	email: FormControl<string>;

	supervisor: FormControl<Employee>;
	sm: FormControl<Employee>;
	gm: FormControl<Employee>;

	dataSource: MatTableDataSource<SalesAgent> = new MatTableDataSource();
	displayedColumns = ['no', 'salesAgentCode', 'fullName', 'handPhone', 'email', 'actions'];
	@ViewChild(MatPaginator) private paginator: MatPaginator;
	errorMessage: string;

	selectedTab: string = 'detail';

	constructor(
		// private activatedRoute: ActivatedRoute,
		private detailService: DetailService,
		private formBuilder: FormBuilder,
		private dialog: MatDialog,
		private dialogRef: MatDialogRef<DetailComponent>,
		private router: Router,
		private utilityService: UtilityService,
		@Inject(MAT_DIALOG_DATA) private data: { propertyAgentId: string | number }
	) { }

	ngOnInit(): void {
		this.isInitialized = false;
		this.formSubmitAttempt = false;

		this.propertyAgentCode = new FormControl(null);
		this.propertyAgentName = new FormControl(null, [Validators.required]);
		this.remark = new FormControl(null);
		this.companyName = new FormControl(null);
		this.ownerName = new FormControl(null);

		this.area = new FormControl(null);
		this.address = new FormControl(null);
		this.phone = new FormControl(null);
		this.fax = new FormControl(null);
		this.email = new FormControl(null);

		this.supervisor = new FormControl(null);
		this.sm = new FormControl(null);
		this.gm = new FormControl(null);

		this.formGroup = this.formBuilder.group({
			propertyAgentCode: this.propertyAgentCode,
			propertyAgentName: this.propertyAgentName,
			remark: this.remark,
			companyName: this.companyName,
			ownerName: this.ownerName,

			area: this.area,
			address: this.address,
			phone: this.phone,
			fax: this.fax,
			email: this.email,
			supervisor: this.supervisor,
			sm: this.sm,
			gm: this.gm,
		});

		// const propertyAgentId = this.activatedRoute.snapshot.paramMap.get('propertyAgentId');
		const propertyAgentId = this.data.propertyAgentId;
		if (propertyAgentId) {
			this.propertyAgentId = +propertyAgentId;
			this.getPropertyAgent()
				.then(() => this.getSalesAgents())
		}
		else {
			this.isInitialized = true;
		}
	}

	getPropertyAgent() {
		return this.detailService.getPropertyAgent(this.propertyAgentId)
			.toPromise()
			.then((propertyAgent: PropertyAgent) => {
				console.log('propertyAgent', propertyAgent);
				this.formGroup.setValue({
					propertyAgentCode: propertyAgent.propertyAgentCode,
					propertyAgentName: propertyAgent.propertyAgentName,
					remark: propertyAgent.remark,
					companyName: propertyAgent.companyName || '',
					ownerName: propertyAgent.ownerName,

					area: propertyAgent.area,
					address: propertyAgent.address,
					phone: propertyAgent.phone,
					fax: propertyAgent.fax,
					email: propertyAgent.email,
					supervisor: null,
					sm: null,
					gm: null,
				})

				this.isInitialized = true;
			});
	}

	searchChanged(value: string) {
		this.dataSource.filter = value.trim().toLowerCase();
	}

	get salesAgentsCount() {
		return this.dataSource.data.length;
	}

	getSalesAgents() {
		return this.detailService.getSalesAgents(this.propertyAgentId)
			.toPromise()
			.then((salesAgents: SalesAgent[]) => {
				console.log('salesAgents', salesAgents);
				this.dataSource.data = salesAgents.map((s: SalesAgent, i: number) => Object.assign({
					no: i + 1
				}, s));
				this.dataSource.paginator = this.paginator;
			})
	}

	addSalesAgent() {
		this.dialog
			.open(SalesAgentComponent, {
				width: '540px',
				data: {
					propertyAgentId: this.propertyAgentId
				}
			})
			.afterClosed()
			.subscribe(result => {
				if (result) {
					this.getSalesAgents();
				}
			});
	}

	editSalesAgent(salesAgentId: number) {
		this.dialog
			.open(SalesAgentComponent, {
				width: '540px',
				data: {
					propertyAgentId: this.propertyAgentId,
					salesAgentId
				}
			})
			.afterClosed()
			.subscribe(result => {
				if (result) {
					this.getSalesAgents();
				}
			});
	}

	deleteSalesAgent(salesAgentId: number) {
		this.utilityService.deleteReason()
			.then((deletedReason) => this.detailService.deleteSalesAgent(this.propertyAgentId, salesAgentId, deletedReason).toPromise())
			.then(() => this.getSalesAgents());

	}

	getEmployees() {
		return this.detailService.getEmployees();
	}

	supervisorSelected(s: Employee) {

	}

	submit() {
		this.formSubmitAttempt = true;
		if (this.formGroup.invalid) {
			this.errorMessage = 'Please fill all required field';
			return;
		}

		const data = this.formGroup.value;
		if (!this.propertyAgentId) {
			this.detailService.insertPropertyAgent(data).subscribe(result => {
				this.dialogRef.close(true);
				// this.router.navigate([`../${result}`], {
				// 	relativeTo: this.activatedRoute,
				// 	replaceUrl: true
				// }).then(() => {
				// 	this.ngOnInit();
				// })
			})
		} else {
			this.detailService.updatePropertyAgent(this.propertyAgentId, data).subscribe(result => {
				this.dialogRef.close(true);
			})
		}
	}

	delete() {
		if (this.dataSource.data.length > 0) {
			this.errorMessage = 'This property agent have Sales Agents, you must delete Sales Agents before you can delete this property agent';
			return;
		}
		this.utilityService.deleteReason()
			.then((result) => {
				if (result) {
					// this.detailService.deletePropertyAgent(this.propertyAgentId, result).toPromise()
					// 	.then(() => this.router.navigate([`..`], {
					// 		relativeTo: this.activatedRoute,
					// 		replaceUrl: true
					// 	}));
				}
			});
	}
}
