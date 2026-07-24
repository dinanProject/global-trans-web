import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
	selector: 'app-handover',
	templateUrl: './handover.component.html',
	styleUrls: ['./handover.component.scss']
})
export class HandoverComponent implements OnInit {

	handoverDate: Date;
	constructor(
		private dialogRef: MatDialogRef<HandoverComponent>
	) { }

	ngOnInit(): void {
		this.handoverDate = new Date();
	}

	save() {
		this.dialogRef.close(formatDate(this.handoverDate, 'yyyy-MM-dd', 'en'));
	}

}
