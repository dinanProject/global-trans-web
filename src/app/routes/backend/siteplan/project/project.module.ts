import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProjectRoutingModule } from './project-routing.module';
import { ProjectComponent } from './project.component';
import { DetailComponent } from './detail/detail.component';
import { UiModule } from 'src/app/modules/ui.module';
import { DirectiveModule } from 'src/app/directives/directive.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
	declarations: [ProjectComponent, DetailComponent],
	imports: [
		CommonModule,
		ProjectRoutingModule,
		UiModule,
		DirectiveModule,
		FormsModule,
		ReactiveFormsModule
	]
})
export class ProjectModule { }
