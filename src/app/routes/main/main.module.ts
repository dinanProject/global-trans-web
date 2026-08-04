import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { FlexLayoutModule } from '@angular/flex-layout';

import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';

import { MainRoutingModule } from './main-routing.module';
import { MainComponent } from './main.component';
import { MenuComponent } from './menu/menu.component';
import { ChangePasswordDialogComponent } from './header-bar/change-password-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { PublicModule } from '../public/public.module';

@NgModule({
	declarations: [MainComponent, MenuComponent, ChangePasswordDialogComponent],
	imports: [
		CommonModule,
		RouterModule,

		ReactiveFormsModule,

		FlexLayoutModule,
		MatDialogModule,
		FlexLayoutModule,
		MatMenuModule,
		MatSidenavModule,
		MatToolbarModule,

		MainRoutingModule,
		PublicModule,
	],
})
export class MainModule {}
