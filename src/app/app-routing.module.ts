import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BackendGuardService } from './routes/backend/backend-guard.service';
import { NotFoundComponent } from './routes/frontend/not-found.component';
import { SalesRegistrationGuardService } from './routes/frontend/sales-registration/sales-registration-guard.service';
import { UnauthorizedComponent } from './routes/frontend/unauthorized.component';
import { UserRegistrationGuardService } from './routes/frontend/user-registration/user-registration-guard.service';

const routes: Routes = [
	{
		path: 'auth',
		loadChildren: () => import('./routes/auth/auth.module').then(m => m.AuthModule)
	},
	{
		path: 'backend',
		loadChildren: () => import('./routes/backend/backend.module').then(m => m.BackendModule),
		canActivate: [BackendGuardService],
		canLoad: [BackendGuardService],
		data: {
			title: 'Siteplan App'
		}
	},
	{
		path: 'sales-registration',
		loadChildren: () => import('./routes/frontend/sales-registration/sales-registration.module').then(m => m.SalesRegistrationModule),
		canActivate: [SalesRegistrationGuardService],
		data: {
			title: 'Sales Registration'
		}
	},
	{
		path: 'user-registration',
		loadChildren: () => import('./routes/frontend/user-registration/user-registration.module').then(m => m.UserRegistrationModule),
		canActivate: [UserRegistrationGuardService],
		data: {
			title: 'User Registration'
		}
	},
	{
		path: '',
		// redirectTo: 'product/new-diamond',
		redirectTo: 'backend',
		pathMatch: 'full'
	},
	{
		path: 'not-found',
		component: NotFoundComponent
	},
	{
		path: 'unauthorized-access',
		component: UnauthorizedComponent
	},
	{
		path: '**',
		component: NotFoundComponent
	}
];

@NgModule({
	imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
	exports: [RouterModule]
})
export class AppRoutingModule { }
