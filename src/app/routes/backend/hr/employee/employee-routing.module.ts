import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DetailComponent } from './detail/detail.component';
import { EmployeeComponent } from './employee.component';

const routes: Routes = [
	{
		path: '',
		component: EmployeeComponent
	},
	{
		path: ':employeeId',
		component: DetailComponent
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class EmployeeRoutingModule { }
