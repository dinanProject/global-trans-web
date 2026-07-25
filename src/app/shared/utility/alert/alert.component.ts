import { Component, Inject, inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export enum AlertType {
	information,
	success,
	warning,
	danger,
}

@Component({
    selector: 'app-alert',
    templateUrl: './alert.component.html',
    styleUrls: ['./alert.component.scss'],
    standalone: false
})
export class AlertComponent implements OnInit {
	title!: string;
	description!: string;
	alertType!: AlertType;

	constructor(
		@Inject(MAT_DIALOG_DATA)
		private data: {
			title: string;
			description: string;
			alertType: AlertType;
		},
		private dialogRef: MatDialogRef<AlertComponent>,
	) {}

	ngOnInit(): void {
		this.title = this.data.title;
		this.description = this.data.description;
		this.alertType = this.data.alertType;
	}

	get iconClass() {
		switch (this.alertType) {
			case 0:
				return 'fas fa-info';
			case 1:
				return 'fas fa-check';
			case 2:
				return 'fas fa-exclamation';
			case 3:
				return 'fas fa-times';
		}
	}

	get buttonClass() {
		switch (this.alertType) {
			case 0:
				return 'btn-primary';
			case 1:
				return 'btn-success';
			case 2:
				return 'btn-warning';
			case 3:
				return 'btn-danger';
		}
	}

	submit() {
		this.dialogRef.close(true);
	}
}
