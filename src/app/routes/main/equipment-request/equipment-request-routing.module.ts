import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RequestComponent } from './request/request.component';
import { ApprovalsComponent } from './approvals/approvals.component';
import { AssignmentsComponent } from './assignments/assignments.component';
import { MonitoringComponent } from './monitoring/monitoring.component';
import { ReportsComponent } from './reports/reports.component';

const routes: Routes = [
	{
		path: '',
		redirectTo: 'requests',
		pathMatch: 'full',
	},

	{
		path: 'requests',
		component: RequestComponent,
	},

	{
		path: 'approvals',
		component: ApprovalsComponent,
	},

	{
		path: 'assignments',
		component: AssignmentsComponent,
	},

	{
		path: 'monitoring',
		component: MonitoringComponent,
	},

	{
		path: 'reports',
		component: ReportsComponent,
	},
];

@NgModule({ imports: [RouterModule.forChild(routes)], exports: [RouterModule] })
export class EquipmentRequestRoutingModule {}
