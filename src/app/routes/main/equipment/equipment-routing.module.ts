import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UnitComponent } from './unit/unit.component';
import { CategoryComponent } from './category/category.component';
import { PermissionGuard } from 'src/app/core/guards/permission-guard';

const routes: Routes = [
	{
		path: 'categories',
		component: CategoryComponent,
	},
	{
		path: 'units',
		component: UnitComponent,
		canActivate: [PermissionGuard],
		data: {
			permission: 'EQUIPMENT_UNIT.VIEW',
		},
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class EquipmentRoutingModule {}
