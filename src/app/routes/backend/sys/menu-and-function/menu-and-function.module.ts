import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MenuAndFunctionRoutingModule } from './menu-and-function-routing.module';
import { MenuAndFunctionComponent } from './menu-and-function.component';
import { MenuComponent } from './menu.component';
import { UiModule } from 'src/app/modules/ui.module';
import { DetailComponent } from './detail/detail.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ParentComponent } from './detail/parent/parent.component';
import { MenuComponent as MenuParentComponent } from './detail/parent/menu/menu.component';


@NgModule({
	declarations: [
		MenuAndFunctionComponent,
		MenuComponent,
		DetailComponent,
		ParentComponent,
		MenuParentComponent
	],
	imports: [
		CommonModule,
		MenuAndFunctionRoutingModule,
		UiModule,
		FormsModule,
		ReactiveFormsModule
	]
})
export class MenuAndFunctionModule { }
