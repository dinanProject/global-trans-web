import {
	Component,
	ContentChild,
	Directive,
	EventEmitter,
	forwardRef,
	Input,
	Output,
	TemplateRef,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { DialogComponent } from './dialog/dialog.component';

@Directive({
	selector: '[option]',
	standalone: false,
})
export class OptionDirective {}

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
		},
	],

	standalone: false,
})
export class OptionDialogComponent<
	T extends Record<string, unknown>,
> implements ControlValueAccessor {
	@Input() title!: string;
	@Input() placeholder: string = '';
	@Input() options!: Observable<T[]>;

	/**
	 * Initial text displayed before an option object is selected.
	 */
	@Input() initialValue: string = '';

	/**
	 * Property name from the option object used as its display value.
	 */
	@Input() valueName: keyof T = 'optionName' as keyof T;

	@Input() addOption: boolean = false;
	@Input() isInvalid: boolean = false;
	@Input() readonly: boolean = false;

	@Output() add: EventEmitter<T> = new EventEmitter<T>();
	@Output() onSelect: EventEmitter<T> = new EventEmitter<T>();

	@ContentChild(OptionDirective, { static: true, read: TemplateRef })
	optionTemplate!: TemplateRef<OptionDirective>;

	option!: T;
	disabled: boolean = false;
	touched: boolean = false;

	onTouched: () => void = () => {};
	onChanged: (option: T) => void = () => {};

	constructor(private dialog: MatDialog) {}

	openDialog(): void {
		this.markAsTouched();

		this.dialog
			.open(DialogComponent, {
				width: '400px',
				data: {
					title: this.title,
					placeholder: this.placeholder,
					options: this.options,
					onAdd: this.addOption ? this.add : null,
					optionTemplate: this.optionTemplate,
				},
			})
			.afterClosed()
			.subscribe((option: T | undefined) => {
				if (!option) {
					return;
				}

				this.writeValue(option);
				this.onChanged(option);
				this.onSelect.emit(option);
			});
	}

	writeValue(option: T): void {
		this.option = option;
	}

	registerOnChange(fn: (option: T) => void): void {
		this.onChanged = fn;
	}

	registerOnTouched(fn: () => void): void {
		this.onTouched = fn;
	}

	setDisabledState(isDisabled: boolean): void {
		this.disabled = isDisabled;
	}

	markAsTouched(): void {
		if (this.touched) {
			return;
		}

		this.onTouched();
		this.touched = true;
	}

	get displayedValue(): string {
		if (!this.option) {
			return this.initialValue;
		}

		const value = this.option[this.valueName];

		return value == null ? '' : String(value);
	}
}
