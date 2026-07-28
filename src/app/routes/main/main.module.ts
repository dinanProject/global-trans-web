import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { FlexLayoutModule } from '@angular/flex-layout';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';

import { MainRoutingModule } from './main-routing.module';
import { MainComponent } from './main.component';
import { MenuComponent } from './menu/menu.component';
import { UiModule } from '../../shared/ui.module';

@NgModule({
	declarations: [MainComponent, MenuComponent],
	imports: [
		CommonModule,
		RouterModule,
		FlexLayoutModule,
		UiModule,
		MatButtonModule,
		MatIconModule,
		MatMenuModule,
		MatSidenavModule,
		MatToolbarModule,

		MainRoutingModule,
	],
})
export class MainModule {}
