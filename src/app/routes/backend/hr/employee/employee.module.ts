import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EmployeeRoutingModule } from './employee-routing.module';
import { EmployeeComponent } from './employee.component';
import { UiModule } from 'src/app/modules/ui.module';
import { DetailComponent } from './detail/detail.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OccupationComponent } from './detail/occupation/occupation.component';

@NgModule({
	declarations: [EmployeeComponent, DetailComponent, OccupationComponent],
	imports: [
		CommonModule,
		EmployeeRoutingModule,
		UiModule,
		FormsModule,
		ReactiveFormsModule
	]
})
export class EmployeeModule { }
