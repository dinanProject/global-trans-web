import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MainGuard } from './main-guard';
import { MainComponent } from './main.component';

const routes: Routes = [
	{
		path: '',
		component: MainComponent,
		children: [
			{
				path: '',
				pathMatch: 'full',
				redirectTo: 'home',
			},

			{
				path: 'home',
				loadChildren: () =>
					import('./home/home.module').then(
						(module) => module.HomeModule,
					),
			},

			/*
			 * Route lama tetap dipertahankan sementara
			 * supaya bookmark atau link lama tidak rusak.
			 */
			{
				path: 'company',
				pathMatch: 'full',
				redirectTo: 'organization/companies',
			},
			{
				path: 'division',
				pathMatch: 'full',
				redirectTo: 'organization/divisions',
			},
			{
				path: 'menu-management',
				pathMatch: 'full',
				redirectTo: 'menus',
			},

			/*
			 * Organization
			 */
			{
				path: 'organization/companies',
				loadChildren: () =>
					import('./company/company.module').then(
						(module) => module.CompanyModule,
					),
			},
			{
				path: 'organization/divisions',
				loadChildren: () =>
					import('./division/division.module').then(
						(module) => module.DivisionModule,
					),
			},

			{
				path: 'equipment',
				loadChildren: () =>
					import('./equipment/equipment.module').then(
						(m) => m.EquipmentModule,
					),
			},

			{
				path: 'administration',
				loadChildren: () =>
					import('./administration/administration.module').then(
						(m) => m.AdministrationModule,
					),
			},

			{
				path: 'menus',
				loadChildren: () =>
					import('./menu-management/menu-management.module').then(
						(m) => m.MenuManagementModule,
					),
			},

			{
				path: 'equipment-request',
				loadChildren: () =>
					import('./equipment-request/equipment-request.module').then(
						(module) => module.EquipmentRequestModule,
					),
			},

			/*
			 * Harus selalu paling terakhir.
			 * Gunakan component langsung supaya URL asli tetap terlihat.
			 */

			{
				path: '**',
				redirectTo: '/not-found',
			},
		],
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class MainRoutingModule {}
