import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './material.module';
import { ThumbModule } from './thumb/thumb.module';
import { LoadingModule } from './loading/loading.module';
import { ImageHolderModule } from './image-holder/image-holder.module';
import { PanelModule } from './panel/panel.module';
import { LoadingButtonModule } from './loading-button/loading-button.module';
import { PageModule } from './page/page.module';
import { ErrorMessageModule } from './error-message/error-message.module';
import { DeleteReasonModule } from './delete-reason/delete-reason.module';
import { UtilityModule } from './utility/utility.module';
import { OptionDialogModule } from './option-dialog/option-dialog.module';
import { SingleInputDialogModule } from './single-input-dialog/single-input-dialog.module';

@NgModule({
	declarations: [],
	imports: [
		CommonModule,
		DeleteReasonModule,
		ErrorMessageModule,
		LoadingModule,
		MaterialModule,
		ThumbModule,
		UtilityModule,
		ImageHolderModule,
		OptionDialogModule,
		PageModule,
		PanelModule,
		LoadingButtonModule,
		SingleInputDialogModule,
	],
	exports: [
		LoadingModule,
		DeleteReasonModule,
		ErrorMessageModule,
		MaterialModule,
		ThumbModule,
		UtilityModule,
		ImageHolderModule,
		OptionDialogModule,
		PageModule,
		PanelModule,
		LoadingButtonModule,
		SingleInputDialogModule,
	],
})
export class UiModule {}
