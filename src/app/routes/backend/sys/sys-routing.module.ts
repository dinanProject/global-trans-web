import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
	{
		path: 'client',
		loadChildren: () => import('./client/client.module').then(m => m.ClientModule),
		data: {
			subtitle: 'Client'
		}
	},
	{
		path: 'email',
		loadChildren: () => import('./email/email.module').then(m => m.EmailModule),
		data: {
			subtitle: 'Email'
		}
	},
	{
		path: 'lookup',
		loadChildren: () => import('./lookup/lookup.module').then(m => m.LookupModule),
		data: {
			subtitle: 'Lookup'
		}
	},
	{
		path: 'menu-and-function',
		loadChildren: () => import('./menu-and-function/menu-and-function.module').then(m => m.MenuAndFunctionModule),
		data: {
			subtitle: 'Menu and Function'
		}
	},
	{
		path: 'role',
		loadChildren: () => import('./role/role.module').then(m => m.RoleModule),
		data: {
			subtitle: 'Role'
		}
	},
	{
		path: 'user',
		loadChildren: () => import('./user/user.module').then(m => m.UserModule),
		data: {
			subtitle: 'User'
		}
	},
	{
		path: 'user-registration',
		loadChildren: () => import('./user-registration/user-registration.module').then(m => m.UserRegistrationModule),
		data: {
			subtitle: 'User Registration'
		}
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class SysRoutingModule { }
