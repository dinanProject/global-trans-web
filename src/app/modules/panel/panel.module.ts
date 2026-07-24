import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PanelBodyComponent, PanelComponent, PanelFilterComponent, PanelFooterComponent, PanelHeaderComponent } from './panel.component';



@NgModule({
	declarations: [
		PanelComponent,
		PanelHeaderComponent,
		PanelFilterComponent,
		PanelBodyComponent,
		PanelFooterComponent
	],
	imports: [
		CommonModule
	],
	exports: [
		PanelComponent,
		PanelHeaderComponent,
		PanelFilterComponent,
		PanelBodyComponent,
		PanelFooterComponent,
	]
})
export class PanelModule { }
