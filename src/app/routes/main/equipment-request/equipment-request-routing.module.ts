import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RequestComponent } from './request/request.component';
import { ApprovalsComponent } from './approvals/approvals.component';
import { ApprovalReviewComponent } from './approvals/approval-review/approval-review.component';
import { AssignmentsComponent } from './assignments/assignments.component';
import { MonitoringComponent } from './monitoring/monitoring.component';
import { ReportsComponent } from './reports/reports.component';
import { PermissionGuard } from 'src/app/core/guards/permission-guard';

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
		path: 'assignments',
		component: AssignmentsComponent,
		canActivate: [PermissionGuard],
		data: {
			permission: 'EQUIPMENT_REQUEST.ASSIGN',
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
		path: 'reports',
		component: ReportsComponent,
	},
];

@NgModule({ imports: [RouterModule.forChild(routes)], exports: [RouterModule] })
export class EquipmentRequestRoutingModule {}
