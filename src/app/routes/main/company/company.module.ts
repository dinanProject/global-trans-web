import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { CompanyDialogComponent } from './company-dialog/company-dialog.component';
import { CompanyRoutingModule } from './company-routing.module';
import { CompanyComponent } from './company.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { PageModule } from 'src/app/shared/page/page.module';
import { PanelModule } from 'src/app/shared/panel/panel.module';
import { LoadingModule } from 'src/app/shared/loading/loading.module';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
	declarations: [CompanyComponent, CompanyDialogComponent],
	imports: [
		CommonModule,
		ReactiveFormsModule,

		MatDialogModule,
		MatMenuModule,
		MatTableModule,

		PageModule,
		PanelModule,
		LoadingModule,

		CompanyRoutingModule,
	],
})
export class CompanyModule {}
