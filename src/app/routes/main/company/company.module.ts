import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { UiModule } from 'src/app/shared/ui.module';

import { CompanyDialogComponent } from './company-dialog/company-dialog.component';
import { CompanyRoutingModule } from './company-routing.module';
import { CompanyComponent } from './company.component';

@NgModule({
	declarations: [CompanyComponent, CompanyDialogComponent],
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		UiModule,
		CompanyRoutingModule,
	],
})
export class CompanyModule {}
