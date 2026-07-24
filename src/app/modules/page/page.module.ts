import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageBodyComponent, PageHeaderComponent } from './page.component';



@NgModule({
	declarations: [
		PageBodyComponent,
		PageHeaderComponent
	],
	imports: [
		CommonModule
	],
	exports: [
		PageBodyComponent,
		PageHeaderComponent
	]
})
export class PageModule { }
