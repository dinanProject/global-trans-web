import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DepartmentAndOccupationComponent } from './department-and-occupation.component';

const routes: Routes = [
	{
		path: '',
		component: DepartmentAndOccupationComponent
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class DepartmentAndOccupationRoutingModule { }
