import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { LocalDateInputComponent } from './local-date-input.component';

@NgModule({
	declarations: [LocalDateInputComponent],
	imports: [CommonModule],
	exports: [LocalDateInputComponent],
})
export class LocalDateInputModule {}
