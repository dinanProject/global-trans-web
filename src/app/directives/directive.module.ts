import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IfAuthDirective } from './if-auth.directive';
import { IfHasMnDirective } from './if-has-mn.directive';
import { IfNotAuthDirective } from './if-not-auth.directive';
import { IfNotHasMnDirective } from './if-not-has-mn.directive';
import { PanAndZoomModule } from './pan-and-zoom/pan-and-zoom.module';
import { PanZoomDirective } from './pan-zoom.directive';
import { NumbersOnlyDirective } from './numbers-only.directive';
import { ReplaceSpaceAndLowerCaseInputDirective } from './replace-space-and-lower-case-input.directive';

@NgModule({
	declarations: [
		IfAuthDirective,
		IfHasMnDirective,
		IfNotAuthDirective,
		IfNotHasMnDirective,
		NumbersOnlyDirective,
		PanZoomDirective,
		ReplaceSpaceAndLowerCaseInputDirective
	],
	imports: [
		CommonModule,
		PanAndZoomModule
	],
	exports: [
		IfAuthDirective,
		IfHasMnDirective,
		IfNotAuthDirective,
		IfNotHasMnDirective,
		PanAndZoomModule,
		NumbersOnlyDirective,
		PanZoomDirective,
		ReplaceSpaceAndLowerCaseInputDirective
	]
})
export class DirectiveModule { }
