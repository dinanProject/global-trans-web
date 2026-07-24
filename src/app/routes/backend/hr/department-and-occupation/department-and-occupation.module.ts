import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DepartmentAndOccupationRoutingModule } from './department-and-occupation-routing.module';
import { DepartmentAndOccupationComponent } from './department-and-occupation.component';
import { DirectiveModule } from 'src/app/directives/directive.module';
import { UiModule } from 'src/app/modules/ui.module';
import { DepartmentComponent } from './department.component';
import { DetailComponent } from './detail/detail.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CompanyComponent } from './company.component';
import { OccupationComponent } from './occupation.component';
import { NodeComponent } from './node.component';


@NgModule({
	declarations: [
		DepartmentAndOccupationComponent,
		DepartmentComponent,
		DetailComponent,
		CompanyComponent,
		OccupationComponent,
		NodeComponent
	],
	imports: [
		CommonModule,
		DepartmentAndOccupationRoutingModule,
		DirectiveModule,
		UiModule,
		FormsModule,
		ReactiveFormsModule
	]
})
export class DepartmentAndOccupationModule { }
