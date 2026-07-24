import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SalesRegistrationComponent } from './sales-registration.component';

const routes: Routes = [
	{
		path: '',
		component: SalesRegistrationComponent
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class SalesRegistrationRoutingModule { }
