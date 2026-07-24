import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserRoutingModule } from './user-routing.module';
import { UserComponent } from './user.component';
import { UiModule } from 'src/app/modules/ui.module';
import { DetailComponent } from './detail/detail.component';
import { DirectiveModule } from 'src/app/directives/directive.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CompanyComponent } from './detail/company.component';


@NgModule({
	declarations: [UserComponent, DetailComponent, CompanyComponent],
	imports: [
		CommonModule,
		UserRoutingModule,
		UiModule,
		DirectiveModule,
		FormsModule,
		ReactiveFormsModule
	]
})
export class UserModule { }
