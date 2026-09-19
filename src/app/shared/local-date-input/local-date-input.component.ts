import {
	Component,
	ElementRef,
	forwardRef,
	Input,
	ViewChild,
} from '@angular/core';
import {
	ControlValueAccessor,
	NG_VALUE_ACCESSOR,
} from '@angular/forms';

export type LocalDateInputMode = 'date' | 'datetime';

@Component({
	selector: 'app-local-date-input',
	templateUrl: './local-date-input.component.html',
	styleUrls: ['./local-date-input.component.scss'],
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => LocalDateInputComponent),
			multi: true,
		},
	],
	standalone: false,
})
export class LocalDateInputComponent implements ControlValueAccessor {
	@ViewChild('nativePicker', { static: true })
	private nativePicker?: ElementRef<HTMLInputElement>;

	@Input() mode: LocalDateInputMode = 'date';
	@Input() inputId = '';
	@Input() min: string | null = null;
	@Input() required = false;

	disabled = false;
	modelValue = '';

	private onChange: (value: string) => void = () => undefined;
	private onTouched: () => void = () => undefined;

	get displayValue(): string {
		if (!this.modelValue) {
			return '';
		}

		const parts = this.extractParts(this.modelValue);
		if (!parts) {
			return this.modelValue;
		}

		const date = `${parts.day}/${parts.month}/${parts.year}`;
		if (this.mode === 'date') {
			return date;
		}

		return `${date} ${parts.hour}:${parts.minute}`;
	}

	get placeholder(): string {
		return this.mode === 'date' ? 'dd/mm/yyyy' : 'dd/mm/yyyy hh:mm';
	}

	get nativeValue(): string {
		if (!this.modelValue) {
			return '';
		}

		const parts = this.extractParts(this.modelValue);
		if (!parts) {
			return '';
		}

		const date = `${parts.year}-${parts.month}-${parts.day}`;
		if (this.mode === 'date') {
			return date;
		}

		return `${date}T${parts.hour}:${parts.minute}`;
	}

	get nativeMin(): string | null {
		if (!this.min) {
			return null;
		}

		const parts = this.extractParts(this.min);
		if (!parts) {
			return this.min;
		}

		const date = `${parts.year}-${parts.month}-${parts.day}`;
		if (this.mode === 'date') {
			return date;
		}

		return `${date}T${parts.hour}:${parts.minute}`;
	}

	writeValue(value: string | null | undefined): void {
		this.modelValue = value ? String(value) : '';
	}

	registerOnChange(fn: (value: string) => void): void {
		this.onChange = fn;
	}

	registerOnTouched(fn: () => void): void {
		this.onTouched = fn;
	}

	setDisabledState(isDisabled: boolean): void {
		this.disabled = isDisabled;
	}

	openPicker(): void {
		if (this.disabled) {
			return;
		}

		const input = this.nativePicker?.nativeElement;
		if (!input) {
			return;
		}

		this.onTouched();

		if (typeof input.showPicker === 'function') {
			input.showPicker();
			return;
		}

		input.click();
	}

	onNativeInput(event: Event): void {
		const input = event.target as HTMLInputElement;
		this.modelValue = input.value || '';
		this.onChange(this.modelValue);
		this.onTouched();
	}

	private extractParts(value: string): {
		year: string;
		month: string;
		day: string;
		hour: string;
		minute: string;
	} | null {
		const text = String(value).trim();
		const match = text.match(
			/^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2})(?::\d{2})?)?/,
		);

		if (!match) {
			return null;
		}

		return {
			year: match[1],
			month: match[2],
			day: match[3],
			hour: match[4] || '00',
			minute: match[5] || '00',
		};
	}
}
