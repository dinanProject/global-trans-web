import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RequestComponent } from './request/request.component';
import { ApprovalsComponent } from './approvals/approvals.component';
import { ReportsComponent } from './reports/reports.component';
import { PermissionGuard } from 'src/app/core/guards/permission-guard';
import { MonitoringComponent } from './monitoring/monitoring.component';
import { ApprovalReviewComponent } from './approvals/approval-review/approval-review.component';
import { OperationsComponent } from './operations/operations.component';

const routes: Routes = [
	{
		path: '',
		redirectTo: 'requests',
		pathMatch: 'full',
	},

	{
		path: 'requests',
		component: RequestComponent,
		canActivate: [PermissionGuard],
		data: {
			permission: 'EQUIPMENT_REQUEST.VIEW',
		},
	},
	{
		path: 'approvals/:uuid/review',
		component: ApprovalReviewComponent,
		canActivate: [PermissionGuard],
		data: {
			permission: 'EQUIPMENT_APPROVAL.VIEW',
		},
	},
	{
		path: 'approvals',
		component: ApprovalsComponent,
		canActivate: [PermissionGuard],
		data: {
			permission: 'EQUIPMENT_APPROVAL.VIEW',
		},
	},
	{
		path: 'monitoring',
		component: MonitoringComponent,
		canActivate: [PermissionGuard],
		data: {
			permission: 'EQUIPMENT_MONITORING.VIEW',
		},
	},

	{
		path: 'operations',
		component: OperationsComponent,
		canActivate: [PermissionGuard],
		data: {
			permission: 'EQUIPMENT_OPERATION.VIEW',
		},
	},

	{
		path: 'reports',
		component: ReportsComponent,
		canActivate: [PermissionGuard],
		data: {
			permission: 'EQUIPMENT_REPORT.VIEW',
		},
	},
];

@NgModule({ imports: [RouterModule.forChild(routes)], exports: [RouterModule] })
export class EquipmentRequestRoutingModule {}
