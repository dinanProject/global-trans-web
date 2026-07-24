import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SiteplanRoutingModule } from './siteplan-routing.module';
import { SiteplanComponent } from './siteplan.component';
import { UiModule } from 'src/app/modules/ui.module';
import { DirectiveModule } from 'src/app/directives/directive.module';


@NgModule({
	declarations: [SiteplanComponent],
	imports: [
		CommonModule,
		SiteplanRoutingModule,
		UiModule,
		DirectiveModule
	]
})
export class SiteplanModule { }
