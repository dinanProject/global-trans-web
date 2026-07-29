import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { EquipmentRequestComponent } from './equipment-request.component';

const routes: Routes = [
	{
		path: '',
		component: EquipmentRequestComponent,
		data: { title: 'Equipment Request', subtitle: '' },
	},
];

@NgModule({ imports: [RouterModule.forChild(routes)], exports: [RouterModule] })
export class EquipmentRequestRoutingModule {}
