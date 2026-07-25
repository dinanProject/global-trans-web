import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PanAndZoomModule } from './pan-and-zoom/pan-and-zoom.module';
import { PanZoomDirective } from './pan-zoom.directive';
import { NumbersOnlyDirective } from './numbers-only.directive';
import { ReplaceSpaceAndLowerCaseInputDirective } from './replace-space-and-lower-case-input.directive';

@NgModule({
	declarations: [
		NumbersOnlyDirective,
		PanZoomDirective,
		ReplaceSpaceAndLowerCaseInputDirective,
	],
	imports: [CommonModule, PanAndZoomModule],
	exports: [
		PanAndZoomModule,
		NumbersOnlyDirective,
		PanZoomDirective,
		ReplaceSpaceAndLowerCaseInputDirective,
	],
})
export class DirectiveModule {}
