import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserRegistrationComponent } from './user-registration.component';

const routes: Routes = [
	{
		path: '',
		component: UserRegistrationComponent,
		children: [
			{
				path: '',
				loadChildren: () => import('./registration-form/registration-form.module').then(m => m.RegistrationFormModule)
			},
			{
				path: 'success',
				loadChildren: () => import('./registration-success/registration-success.module').then(m => m.RegistrationSuccessModule)
			}
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class UserRegistrationRoutingModule { }
