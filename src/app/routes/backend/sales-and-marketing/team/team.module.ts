import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TeamRoutingModule } from './team-routing.module';
import { TeamComponent } from './team.component';
import { DetailComponent } from './detail/detail.component';
import { UiModule } from 'src/app/modules/ui.module';
import { EmployeeComponent } from './detail/employee/employee.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChangeTeamComponent } from './detail/change-team/change-team.component';


@NgModule({
	declarations: [
		TeamComponent,
		DetailComponent,
		EmployeeComponent,
  ChangeTeamComponent
	],
	imports: [
		CommonModule,
		TeamRoutingModule,
		UiModule,
		FormsModule,
		ReactiveFormsModule
	]
})
export class TeamModule { }
