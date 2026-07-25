import { Component, ContentChild, Directive, EventEmitter, forwardRef, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { DialogComponent } from './dialog/dialog.component';

@Directive({
	selector: '[option]'
})
export class OptionDirective { }
export interface OptionItem {
	optionId: number;
	optionName: string;
}

export type OnOptionAdd = (optionName: string) => Promise<any>;
export type OnOptionChanged<T> = (option: T) => Promise<T>;
@Component({
	selector: 'option-dialog',
	templateUrl: './option-dialog.component.html',
	styleUrls: ['./option-dialog.component.scss'],
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			multi: true,
			useExisting: forwardRef(() => OptionDialogComponent),
		}
	],
	host: {
		'(change)': 'onChange()'
	}
})
export class OptionDialogComponent<T> implements ControlValueAccessor {

	@Input() title: string;
	@Input() placeholder: string = '';
	@Input() options: Observable<T[]>;
	@Input() initialValue: T;
	@Input() valueName: string = 'optionName';
	@Input() addOption: boolean = false;
	@Input() isInvalid: boolean = false;
	@Input() readonly: boolean = false;

	@Output() add: EventEmitter<T> = this.readonly ? null : new EventEmitter<T>();
	@Output() onSelect: EventEmitter<T> = this.readonly ? null : new EventEmitter<T>();

	@ContentChild(OptionDirective, { static: true, read: TemplateRef })
	optionTemplate: TemplateRef<OptionDirective>;
	option: T;
	disabled: boolean = this.readonly;
	touched: boolean = false;

	onTouched = (t: T) => { };
	onChanged = (t: T) => { };

	constructor(
		private dialog: MatDialog
	) { }

	openDialog() {
		this.markAsTouched();
		this.dialog
			.open(DialogComponent, {
				width: '400px',
				data: {
					title: this.title,
					placeholder: this.placeholder,
					options: this.options,
					onAdd: this.addOption ? this.add : null,
					optionTemplate: this.optionTemplate
				}
			})
			.afterClosed()
			.subscribe((option: T) => {
				if (option) {
					this.writeValue(option);
					this.onChanged(option);
					this.onSelect.emit(option);
				}
			})
	}

	writeValue(option: T): void {
		this.option = option;
	}

	registerOnChange(fn: any): void {
		this.onChanged = fn; // <-- save the function
	}

	registerOnTouched(fn: any): void {
		this.onTouched = fn; // <-- save the function
	}

	setDisabledState(isDisabled: boolean) {
		this.disabled = isDisabled;
	}

	markAsTouched() {
		if (!this.touched) {
			this.onTouched(this.option);
			this.touched = true;
		}
	}

	get displayedValue(): string {
		return this.option ? this.option[this.valueName] : this.initialValue;
	}
}
