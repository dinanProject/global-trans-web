import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
	selector: 'app-akad',
	templateUrl: './akad.component.html',
	styleUrls: ['./akad.component.scss']
})
export class AkadComponent implements OnInit {

	akadDate: Date;
	constructor(
		private dialogRef: MatDialogRef<AkadComponent>
	) { }

	ngOnInit(): void {
		this.akadDate = new Date();
	}

	save() {
		this.dialogRef.close(formatDate(this.akadDate, 'yyyy-MM-dd', 'en'));
	}
}
