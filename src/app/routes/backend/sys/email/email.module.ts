import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EmailRoutingModule } from './email-routing.module';
import { EmailComponent } from './email.component';
import { UiModule } from 'src/app/modules/ui.module';
import { DirectiveModule } from 'src/app/directives/directive.module';
import { DetailComponent } from './detail/detail.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RecepientComponent } from './recepient/recepient.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';


@NgModule({
	declarations: [
		EmailComponent,
		DetailComponent,
		RecepientComponent
	],
	imports: [
		CommonModule,
		EmailRoutingModule,
		UiModule,
		DirectiveModule,
		FormsModule,
		ReactiveFormsModule,
		CKEditorModule
	]
})
export class EmailModule { }
