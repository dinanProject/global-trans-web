import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { UtilityType } from '../utility/utility.service';

export interface UtilityDialogData {
	mode: 'alert' | 'confirm';
	title: string;
	description: string;
	type: UtilityType;
	cancelText?: string;
	confirmText?: string;
}

@Component({
	selector: 'app-utility-dialog',
	templateUrl: './utility-dialog.component.html',
	styleUrls: ['./utility-dialog.component.scss'],
	standalone: false,
})
export class UtilityDialogComponent {
	constructor(
		private readonly dialogRef: MatDialogRef<UtilityDialogComponent>,
		@Inject(MAT_DIALOG_DATA)
		public readonly dialogData: UtilityDialogData,
	) {}

	get icon(): string {
		switch (this.dialogData.type) {
			case 'success':
				return 'fas fa-check-circle';

			case 'warning':
				return 'fas fa-exclamation-triangle';

			case 'danger':
				return 'fas fa-times-circle';

			default:
				return 'fas fa-info-circle';
		}
	}

	get confirmButtonClass(): string {
		switch (this.dialogData.type) {
			case 'danger':
				return 'btn btn-danger';

			case 'warning':
				return 'btn btn-warning';

			case 'success':
				return 'btn btn-success';

			default:
				return 'btn btn-primary';
		}
	}

	cancel(): void {
		this.dialogRef.close(false);
	}

	confirm(): void {
		this.dialogRef.close(true);
	}
}
