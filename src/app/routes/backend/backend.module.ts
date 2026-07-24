import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BackendRoutingModule } from './backend-routing.module';
import { BackendComponent } from './backend.component';
import { UiModule } from 'src/app/modules/ui.module';
import { MenuComponent } from './menu.component';
import { NotFoundComponent } from './not-found.component';
import { HomeComponent } from './home.component';
import { ProfileComponent } from './profile.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
	declarations: [
		BackendComponent,
		MenuComponent,
		NotFoundComponent,
		HomeComponent,
		ProfileComponent
	],
	imports: [
		CommonModule,
		BackendRoutingModule,
		UiModule,
		FormsModule,
		ReactiveFormsModule
	]
})
export class BackendModule { }
