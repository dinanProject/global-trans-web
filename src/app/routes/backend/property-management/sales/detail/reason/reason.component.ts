import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
	selector: 'app-reason',
	templateUrl: './reason.component.html',
	styleUrls: ['./reason.component.scss']
})
export class ReasonComponent implements OnInit {

	cancelationDate: Date;
	cancelationReason: string;
	formSubmitAttempt: boolean;

	constructor(
		private dialogRef: MatDialogRef<ReasonComponent>
	) { }

	ngOnInit(): void {
		this.cancelationDate = new Date();
	}

	save() {
		this.formSubmitAttempt = true;
		if (!this.cancelationReason) {
			return;
		}

		this.dialogRef.close({
			cancelationDate: formatDate(this.cancelationDate, 'yyyy-MM-dd', 'en'),
			cancelationReason: this.cancelationReason
		});
	}
}
