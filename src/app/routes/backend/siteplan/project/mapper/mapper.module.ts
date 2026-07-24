import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MapperRoutingModule } from './mapper-routing.module';
import { MapperComponent } from './mapper.component';
import { UiModule } from 'src/app/modules/ui.module';
import { DirectiveModule } from 'src/app/directives/directive.module';


@NgModule({
	declarations: [MapperComponent],
	imports: [
		CommonModule,
		MapperRoutingModule,
		UiModule,
		DirectiveModule
	]
})
export class MapperModule { }
