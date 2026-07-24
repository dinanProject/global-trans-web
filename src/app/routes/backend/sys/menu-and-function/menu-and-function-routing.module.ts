import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MenuAndFunctionComponent } from './menu-and-function.component';

const routes: Routes = [
	{
		path: '',
		component: MenuAndFunctionComponent
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class MenuAndFunctionRoutingModule { }
