import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { DetailService, Lead, LeadHistory } from './detail.service';

@Component({
	selector: 'app-detail',
	templateUrl: './detail.component.html',
	styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {

	isInitialized: boolean;
	isHistoryInitialized: boolean;
	leadId: number;
	lead: Lead;

	formGroup: UntypedFormGroup;
	fullName: UntypedFormControl;
	locationName: UntypedFormControl;
	phoneNumber: UntypedFormControl;

	dataSource: MatTableDataSource<LeadHistory> = new MatTableDataSource();
	displayedColumns = ['no', 'historyDate', 'description'];

	constructor(
		private activatedRoute: ActivatedRoute,
		private formBuilder: UntypedFormBuilder,
		private detailService: DetailService
	) { }

	ngOnInit(): void {
		this.isInitialized = false;
		this.isHistoryInitialized = false;
		this.leadId = +this.activatedRoute.snapshot.paramMap.get('leadId');

		this.fullName = new UntypedFormControl('', [Validators.required]);
		this.locationName = new UntypedFormControl('', [Validators.required]);
		this.phoneNumber = new UntypedFormControl('', [Validators.required]);

		this.formGroup = this.formBuilder.group({
			fullName: this.fullName,
			locationName: this.locationName,
			phoneNumber: this.phoneNumber,
		});

		this.getLead()
			.then(() => this.getLeadHistories());
	}

	getLead() {
		this.isInitialized = false;
		return this.detailService.getLead(this.leadId)
			.toPromise()
			.then((lead: Lead) => {
				this.lead = lead;
				this.formGroup.setValue({
					fullName: lead.fullName,
					locationName: lead.locationName,
					phoneNumber: lead.phoneNumber,
				})
				this.isInitialized = true;
			})
	}

	getLeadHistories() {
		this.isHistoryInitialized = false;
		return this.detailService.getLeadHistory(this.leadId)
			.toPromise()
			.then((leadHistories: LeadHistory[]) => {
				console.log('leadHistories', leadHistories);
				this.dataSource.data = leadHistories.map((l: LeadHistory, i: number) => Object.assign(l, {
					no: i + 1
				}));
				this.isHistoryInitialized = true;
			})
	}

}
