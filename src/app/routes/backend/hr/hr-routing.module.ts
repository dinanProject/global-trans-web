import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
	{
		path: 'department-and-occupation',
		loadChildren: () => import('./department-and-occupation/department-and-occupation.module').then(m => m.DepartmentAndOccupationModule),
		data: {
			subtitle: 'Department And Occupation'
		}
	},
	{
		path: 'employee',
		loadChildren: () => import('./employee/employee.module').then(m => m.EmployeeModule),
		data: {
			subtitle: 'Employee'
		}
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class HrRoutingModule { }
