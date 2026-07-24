import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CompanyRoutingModule } from './company-routing.module';
import { CompanyComponent } from './company.component';
import { UiModule } from 'src/app/modules/ui.module';
import { DetailComponent } from './detail/detail.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RowComponent } from './row.component';


@NgModule({
	declarations: [CompanyComponent, DetailComponent, RowComponent],
	imports: [
		CommonModule,
		CompanyRoutingModule,
		UiModule,
		FormsModule,
		ReactiveFormsModule
	]
})
export class CompanyModule { }
