import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RoleRoutingModule } from './role-routing.module';
import { RoleComponent } from './role.component';
import { UiModule } from 'src/app/modules/ui.module';
import { DetailComponent } from './detail/detail.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenuComponent } from './detail/menu.component';


@NgModule({
	declarations: [RoleComponent, DetailComponent, MenuComponent],
	imports: [
		CommonModule,
		RoleRoutingModule,
		UiModule,
		FormsModule,
		ReactiveFormsModule
	]
})
export class RoleModule { }
