import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClientRoutingModule } from './client-routing.module';
import { ClientComponent } from './client.component';
import { UiModule } from 'src/app/modules/ui.module';
import { DirectiveModule } from 'src/app/directives/directive.module';
import { DetailComponent } from './detail/detail.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenuComponent } from './detail/menu.component';


@NgModule({
	declarations: [ClientComponent, DetailComponent, MenuComponent],
	imports: [
		CommonModule,
		ClientRoutingModule,
		UiModule,
		DirectiveModule,
		FormsModule,
		ReactiveFormsModule
	]
})
export class ClientModule { }
