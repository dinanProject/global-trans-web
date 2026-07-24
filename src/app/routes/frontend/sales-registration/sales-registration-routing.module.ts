import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SalesRegistrationComponent } from './sales-registration.component';

const routes: Routes = [
	{
		path: '',
		component: SalesRegistrationComponent,
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
export class SalesRegistrationRoutingModule { }
