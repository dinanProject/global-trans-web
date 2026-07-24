import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SalesRevisionRoutingModule } from './sales-revision-routing.module';
import { SalesRevisionComponent } from './sales-revision.component';
import { DetailComponent } from './detail/detail.component';
import { UiModule } from 'src/app/modules/ui.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DirectiveModule } from 'src/app/directives/directive.module';
import { NgxCurrencyModule } from 'ngx-currency';


@NgModule({
	declarations: [
		SalesRevisionComponent,
		DetailComponent
	],
	imports: [
		CommonModule,
		SalesRevisionRoutingModule,
		FormsModule,
		ReactiveFormsModule,
		NgxCurrencyModule,
		DirectiveModule,
		UiModule
	]
})
export class SalesRevisionModule { }
