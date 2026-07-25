import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingButtonComponent } from './loading-button.component';
import { FlexLayoutModule } from '@angular/flex-layout';



@NgModule({
	declarations: [
		LoadingButtonComponent
	],
	imports: [
		CommonModule,
		FlexLayoutModule
	],
	exports: [
		LoadingButtonComponent
	]
})
export class LoadingButtonModule { }
