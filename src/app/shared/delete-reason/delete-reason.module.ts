import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeleteReasonComponent } from './delete-reason.component';
import { MaterialModule } from '../material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ErrorMessageModule } from '../error-message/error-message.module';



@NgModule({
	declarations: [
		DeleteReasonComponent
	],
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		MaterialModule,
		ErrorMessageModule
	]
})
export class DeleteReasonModule { }
