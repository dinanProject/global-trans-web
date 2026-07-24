import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LookupRoutingModule } from './lookup-routing.module';
import { LookupComponent } from './lookup.component';
import { UiModule } from 'src/app/modules/ui.module';
import { DetailComponent } from './detail/detail.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
	declarations: [LookupComponent, DetailComponent],
	imports: [
		CommonModule,
		LookupRoutingModule,
		UiModule,
		FormsModule,
		ReactiveFormsModule
	]
})
export class LookupModule { }
