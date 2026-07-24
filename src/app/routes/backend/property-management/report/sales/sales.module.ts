import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SalesRoutingModule } from './sales-routing.module';
import { SalesComponent } from './sales.component';
import { UiModule } from 'src/app/modules/ui.module';


@NgModule({
	declarations: [SalesComponent],
	imports: [
		CommonModule,
		SalesRoutingModule,
		UiModule
	]
})
export class SalesModule { }
