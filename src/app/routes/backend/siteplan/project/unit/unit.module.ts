import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UnitRoutingModule } from './unit-routing.module';
import { UnitComponent } from './unit.component';
import { DetailComponent } from './detail/detail.component';
import { UiModule } from 'src/app/modules/ui.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DirectiveModule } from 'src/app/directives/directive.module';


@NgModule({
	declarations: [UnitComponent, DetailComponent],
	imports: [
		CommonModule,
		UnitRoutingModule,
		UiModule,
		DirectiveModule,
		FormsModule,
		ReactiveFormsModule
	]
})
export class UnitModule { }
