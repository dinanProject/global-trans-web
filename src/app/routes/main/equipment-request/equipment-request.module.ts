import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { EquipmentRequestRoutingModule } from './equipment-request-routing.module';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { PageModule } from 'src/app/shared/page/page.module';
import { PanelModule } from 'src/app/shared/panel/panel.module';
import { LoadingModule } from 'src/app/shared/loading/loading.module';
import { RequestDetailDialogComponent } from './request/request-detail-dialog/request-detail-dialog.component';
import { RequestFormDialogComponent } from './request/request-form-dialog/request-form-dialog.component';
import { ReportsComponent } from './reports/reports.component';
import { ApprovalsComponent } from './approvals/approvals.component';
import { RequestComponent } from './request/request.component';
import { LoadingButtonModule } from 'src/app/shared/loading-button/loading-button.module';
import { MonitoringComponent } from './monitoring/monitoring.component';
import { ApprovalReviewComponent } from './approvals/approval-review/approval-review.component';
import { AssignmentsComponent } from './assignments/assignments.component';

@NgModule({
	declarations: [
		RequestComponent,
		RequestFormDialogComponent,
		RequestDetailDialogComponent,
		ApprovalsComponent,
		ApprovalReviewComponent,
		AssignmentsComponent,
		MonitoringComponent,
		ReportsComponent,
	],
	imports: [
		CommonModule,
		ReactiveFormsModule,
		EquipmentRequestRoutingModule,

		PageModule,
		PanelModule,
		LoadingModule,
		LoadingButtonModule,

		MatTableModule,
		MatMenuModule,
		MatDialogModule,
		MatTabsModule,
		FormsModule,
	],
})
export class EquipmentRequestModule {}
