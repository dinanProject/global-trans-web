import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { FlexLayoutModule } from '@angular/flex-layout';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';

import { MainRoutingModule } from './main-routing.module';
import { MainComponent } from './main.component';

@NgModule({
	declarations: [MainComponent],
	imports: [
		CommonModule,
		RouterModule,
		ReactiveFormsModule,
		FlexLayoutModule,
		MatSidenavModule,
		MatToolbarModule,
		MatMenuModule,
		MatButtonModule,
		MatIconModule,
		MainRoutingModule,
	],
})
export class MainModule {}
