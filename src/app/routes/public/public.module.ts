import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { NotFoundComponent } from './not-found.component';
import { UnauthorizedComponent } from './unauthorized.component';

@NgModule({
	declarations: [NotFoundComponent, UnauthorizedComponent],
	imports: [CommonModule],
	exports: [NotFoundComponent, UnauthorizedComponent],
})
export class PublicModule {}
