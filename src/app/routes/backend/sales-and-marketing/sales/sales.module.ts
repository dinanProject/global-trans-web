import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SalesRoutingModule } from './sales-routing.module';
import { SalesComponent } from './sales.component';
import { UiModule } from 'src/app/modules/ui.module';
import { DetailComponent } from './detail/detail.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AddComponent } from './add/add.component';
import { EmployeeComponent } from './add/employee/employee.component';


@NgModule({
	declarations: [
		SalesComponent,
		DetailComponent,
  AddComponent,
  EmployeeComponent
	],
	imports: [
		CommonModule,
		SalesRoutingModule,
		UiModule,
		FormsModule,
		ReactiveFormsModule
	]
})
export class SalesModule { }
