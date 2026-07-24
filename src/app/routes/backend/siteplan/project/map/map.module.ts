import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MapRoutingModule } from './map-routing.module';
import { MapComponent } from './map.component';
import { UiModule } from 'src/app/modules/ui.module';
import { DirectiveModule } from 'src/app/directives/directive.module';
import { DetailComponent } from './detail/detail.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxCurrencyModule } from 'ngx-currency';


@NgModule({
	declarations: [MapComponent, DetailComponent],
	imports: [
		CommonModule,
		MapRoutingModule,
		UiModule,
		DirectiveModule,
		FormsModule,
		ReactiveFormsModule,
		NgxCurrencyModule
	]
})
export class MapModule { }
