import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UnitComponent } from './unit/unit.component';
import { CategoryComponent } from './category/category.component';

const routes: Routes = [
	{
		path: 'categories',
		component: CategoryComponent,
	},
	{
		path: 'units',
		component: UnitComponent,
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class EquipmentRoutingModule {}
