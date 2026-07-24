import { formatDate } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PropertyAgentComponent } from '../property-agent/property-agent.component';
import { PropertyAgent } from '../property-agent/property-agent.service';
import { LeadPropertyAgent, LeadPropertyAgentService } from './lead-property-agent.service';

@Component({
	selector: 'app-lead-property-agent',
	templateUrl: './lead-property-agent.component.html',
	styleUrls: ['./lead-property-agent.component.scss']
})
export class LeadPropertyAgentComponent implements OnInit {

	isInitialized: boolean;

	formGroup: FormGroup;
	propertyAgentId: FormControl<number>;
	startDate: FormControl<Date>;
	endDate: FormControl<Date>;

	propertyAgentName: string;

	formSubmitAttempt: boolean;

	constructor(
		private formBuilder: FormBuilder,
		private dialog: MatDialog,
		private dialogRef: MatDialogRef<LeadPropertyAgentComponent>,
		@Inject(MAT_DIALOG_DATA) private data: { projectId: number, projectLeadPropertyAgentId: number },
		private leadPropertyAgentService: LeadPropertyAgentService
	) { }

	ngOnInit(): void {
		this.isInitialized = false;
		this.propertyAgentId = new FormControl(null, [Validators.required]);
		this.startDate = new FormControl(new Date(), [Validators.required]);
		this.endDate = new FormControl(new Date(), [Validators.required]);

		this.formGroup = this.formBuilder.group({
			propertyAgentId: this.propertyAgentId,
			startDate: this.startDate,
			endDate: this.endDate,
		})

		if (this.data.projectLeadPropertyAgentId) {
			this.getLeadPropertyAgent();
		} else {
			this.isInitialized = true;
		}
	}

	get isReadOnly() {
		return !!this.data?.projectLeadPropertyAgentId;
	}

	getLeadPropertyAgent() {
		this.leadPropertyAgentService.getLeadPropertyAgent(this.data.projectId, this.data.projectLeadPropertyAgentId)
			.toPromise()
			.then((l: LeadPropertyAgent) => {
				this.propertyAgentId.setValue(l.propertyAgentId);
				this.propertyAgentName = l.propertyAgentName;
				this.startDate.setValue(l.startDate);
				this.endDate.setValue(l.endDate);
				this.isInitialized = true;
			})
	}

	selectPropertyAgent() {
		this.dialog
			.open(PropertyAgentComponent, {
				width: '400px',
				data: {
					projectId: this.data.projectId
				}
			})
			.afterClosed()
			.subscribe((propertyAgent: PropertyAgent) => {
				if (propertyAgent) {
					console.log(propertyAgent);
					this.propertyAgentId.setValue(propertyAgent.propertyAgentId);
					this.propertyAgentName = propertyAgent.propertyAgentName;
				}
			});
	}

	submit() {
		this.formSubmitAttempt = true;
		if (this.formGroup.invalid) {
			return;
		}

		const data = this.formGroup.value;
		data.startDate = formatDate(data.startDate, 'yyyy-MM-dd', 'en');
		data.endDate = formatDate(data.endDate, 'yyyy-MM-dd', 'en');

		if (this.data.projectLeadPropertyAgentId) {
			this.leadPropertyAgentService.update(this.data.projectId, this.data.projectLeadPropertyAgentId, data)
				.subscribe(result => {
					this.dialogRef.close(true);
				});
		} else {
			this.leadPropertyAgentService.insert(this.data.projectId, data)
				.subscribe(result => {
					this.dialogRef.close(true);
				});
		}
	}
}
