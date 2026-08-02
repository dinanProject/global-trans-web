import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MainGuard } from './routes/main/main-guard';

const routes: Routes = [
	{
		path: 'auth',
		loadChildren: () =>
			import('./routes/auth/auth.module').then(
				(module) => module.AuthModule,
			),
	},
	{
		path: '',
		loadChildren: () =>
			import('./routes/main/main.module').then(
				(module) => module.MainModule,
			),
		canActivate: [MainGuard],
		canLoad: [MainGuard],
		data: {
			title: 'Main App',
		},
	},
	{
		path: '**',
		redirectTo: 'home',
	},
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule],
})
export class AppRoutingModule {}
