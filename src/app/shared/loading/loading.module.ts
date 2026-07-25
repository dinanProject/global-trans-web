import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingComponent } from './loading.component';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
	declarations: [LoadingComponent],
	imports: [
		CommonModule,
		FlexLayoutModule
	],
	exports: [
		LoadingComponent
	]
})
export class LoadingModule { }
