import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialModule } from '../material.module';
import { UtilityDialogComponent } from './utility-dialog.component';

@NgModule({
	declarations: [UtilityDialogComponent],
	imports: [CommonModule, MaterialModule],
	exports: [UtilityDialogComponent],
})
export class UtilityModule {}
