import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SiteplanMapperRoutingModule } from './siteplan-mapper-routing.module';
import { SiteplanMapperComponent } from './siteplan-mapper.component';
import { UiModule } from 'src/app/modules/ui.module';
import { DirectiveModule } from 'src/app/directives/directive.module';


@NgModule({
	declarations: [SiteplanMapperComponent],
	imports: [
		CommonModule,
		SiteplanMapperRoutingModule,
		UiModule,
		DirectiveModule
	]
})
export class SiteplanMapperModule { }
