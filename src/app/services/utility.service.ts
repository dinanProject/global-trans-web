import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DeleteReasonComponent } from '../modules/delete-reason/delete-reason.component';
import { OnOptionAdd, OptionDialogComponent, OptionItem } from '../modules/option-dialog/option-dialog.component';
import { SingleInputDialogComponent } from '../modules/single-input-dialog/single-input-dialog.component';
import { AlertComponent, AlertType } from '../modules/utility/alert/alert.component';
import { ConfirmComponent } from '../modules/utility/confirm/confirm.component';

@Injectable({
	providedIn: 'root'
})
export class UtilityService {

	constructor(
		private dialog: MatDialog
	) { }

	alert(title: string, description: string, alertType: AlertType): Promise<boolean> {
		return this.dialog
			.open(AlertComponent, {
				width: '440px',
				data: {
					title,
					description,
					alertType
				},
				disableClose: true
			})
			.afterClosed()
			.toPromise()
			.then(result => !!result);
	}

	confirm(title: string, description: string, showReason: boolean = false): Promise<boolean> {
		return this.dialog
			.open(ConfirmComponent, {
				width: '400px',
				data: {
					title,
					description,
					showReason
				},
				disableClose: true
			})
			.afterClosed()
			.toPromise();
	}

	deleteReason() {
		return this.dialog
			.open(DeleteReasonComponent, {
				width: '400px'
			})
			.afterClosed()
			.toPromise();
	}

	optionDialog(title: string, placeholder: string, optionItems: OptionItem[], onAdd?: OnOptionAdd) {
		return this.dialog
			.open(OptionDialogComponent, {
				width: '400px',
				data: {
					title,
					placeholder,
					optionItems,
					onAdd
				}
			})
			.afterClosed()
			.toPromise();
	}

	singleInputDialog(title: string, label?: string, placeholder?: string) {
		label = label ?? title;
		placeholder = placeholder ?? title;

		return this.dialog
			.open(SingleInputDialogComponent, {
				width: '300px',
				data: {
					type: 'input',
					title,
					label,
					placeholder
				}
			})
			.afterClosed()
			.toPromise();
	}

	singleTextareaDialog(title: string, label?: string, placeholder?: string) {
		label = label ?? title;
		placeholder = placeholder ?? title;

		return this.dialog
			.open(SingleInputDialogComponent, {
				width: '300px',
				data: {
					type: 'textarea',
					title,
					label,
					placeholder
				}
			})
			.afterClosed()
			.toPromise();
	}

	singleDatePickerDialog(title: string, label?: string, placeholder?: string, initialValue?: any) {
		label = label ?? title;
		placeholder = placeholder ?? title;

		return this.dialog
			.open(SingleInputDialogComponent, {
				width: '300px',
				data: {
					type: 'datepicker',
					title,
					label,
					placeholder,
					initialValue
				}
			})
			.afterClosed()
			.toPromise();
	}

}
