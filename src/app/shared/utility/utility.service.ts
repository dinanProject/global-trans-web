import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import {
	UtilityDialogComponent,
	UtilityDialogData,
} from './utility-dialog.component';

export type UtilityType = 'success' | 'warning' | 'error' | 'information';

@Injectable({
	providedIn: 'root',
})
export class UtilityService {
	constructor(private readonly dialog: MatDialog) {}

	alert(
		title: string,
		description: string,
		type: UtilityType = 'information',
	): Promise<void> {
		const dialogRef = this.dialog.open<
			UtilityDialogComponent,
			UtilityDialogData,
			boolean
		>(UtilityDialogComponent, {
			width: '420px',
			maxWidth: '95vw',
			disableClose: true,
			data: {
				mode: 'alert',
				title,
				description,
				type,
				confirmText: 'OK',
			},
		});

		return dialogRef
			.afterClosed()
			.toPromise()
			.then(() => undefined);
	}

	confirm(
		title: string,
		description: string,
		type: UtilityType = 'warning',
	): Promise<boolean | void> {
		const dialogRef = this.dialog.open<
			UtilityDialogComponent,
			UtilityDialogData,
			boolean
		>(UtilityDialogComponent, {
			width: '420px',
			maxWidth: '95vw',
			disableClose: true,
			data: {
				mode: 'confirm',
				title,
				description,
				type,
				cancelText: 'Cancel',
				confirmText: 'Confirm',
			},
		});

		return dialogRef.afterClosed().toPromise();
	}
}
