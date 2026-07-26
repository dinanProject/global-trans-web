import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';

import {
	UtilityDialogComponent,
	UtilityDialogData,
} from './utility-dialog.component';

export type UtilityType = 'information' | 'success' | 'warning' | 'danger';

@Injectable({
	providedIn: 'root',
})
export class UtilityService {
	constructor(private readonly dialog: MatDialog) {}

	alert(
		title: string,
		description: string,
		type: UtilityType,
	): Promise<boolean | void> {
		const dialogRef = this.dialog.open(UtilityDialogComponent, {
			width: '430px',
			disableClose: true,
			data: {
				mode: 'alert',
				title,
				description,
				type,
				confirmText: 'OK',
			} satisfies UtilityDialogData,
		});

		return firstValueFrom(dialogRef.afterClosed());
	}

	confirm(
		title: string,
		description: string,
		type: UtilityType,
	): Promise<boolean | void> {
		const dialogRef = this.dialog.open(UtilityDialogComponent, {
			width: '430px',
			disableClose: true,
			data: {
				mode: 'confirm',
				title,
				description,
				type,
				cancelText: 'Cancel',
				confirmText: 'Confirm',
			} satisfies UtilityDialogData,
		});

		return firstValueFrom(dialogRef.afterClosed());
	}

	uuidv4(): string {
		if (
			typeof crypto !== 'undefined' &&
			typeof crypto.randomUUID === 'function'
		) {
			return crypto.randomUUID();
		}

		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
			/[xy]/g,
			(character) => {
				const random = (Math.random() * 16) | 0;
				const value = character === 'x' ? random : (random & 0x3) | 0x8;

				return value.toString(16);
			},
		);
	}
}
