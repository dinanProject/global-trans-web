import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MainGuard } from './routes/main/main-guard';
import { UnauthorizedComponent } from './routes/public/unauthorized.component';
import { NotFoundComponent } from './routes/public/not-found.component';

const routes: Routes = [
	{
		path: 'auth',
		loadChildren: () =>
			import('./routes/auth/auth.module').then(
				(module) => module.AuthModule,
			),
	},
	{
		path: 'unauthorized',
		component: UnauthorizedComponent,
		data: {
			title: 'Access Denied',
		},
	},
	{
		path: 'not-found',
		component: NotFoundComponent,
		data: {
			title: 'Page Not Found',
		},
	},
	{
		path: '',
		loadChildren: () =>
			import('./routes/main/main.module').then(
				(module) => module.MainModule,
			),
		canActivate: [MainGuard],
		data: {
			title: 'Main App',
		},
	},
	{
		path: '**',
		redirectTo: 'not-found',
	},
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule],
})
export class AppRoutingModule {}
