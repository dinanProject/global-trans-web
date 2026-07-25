import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainGuardService } from './routes/main/main-guard.service';

const routes: Routes = [
	{
		path: 'auth',
		loadChildren: () =>
			import('./routes/auth/auth.module').then(
				(module) => module.AuthModule,
			),
	},
	{
		path: 'main',
		loadChildren: () =>
			import('./routes/main/main.module').then((m) => m.MainModule),
		canActivate: [MainGuardService],
		canLoad: [MainGuardService],
		data: {
			title: 'Main App',
		},
	},
];

@NgModule({
	imports: [
		RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' }),
	],
	exports: [RouterModule],
})
export class AppRoutingModule {}
