import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AreaRoutingModule } from './area-routing.module';
import { AreaComponent } from './area.component';
import { UiModule } from 'src/app/modules/ui.module';
import { ProvinceComponent } from './province.component';
import { CityComponent } from './city.component';
import { DistrictComponent } from './district.component';
import { SubdistrictComponent } from './subdistrict.component';

@NgModule({
	declarations: [
		AreaComponent,
  ProvinceComponent,
  CityComponent,
  DistrictComponent,
  SubdistrictComponent
	],
	imports: [
		CommonModule,
		AreaRoutingModule,
		UiModule
	]
})
export class AreaModule { }
