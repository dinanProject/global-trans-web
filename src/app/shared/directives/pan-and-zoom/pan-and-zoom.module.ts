import { NgModule } from '@angular/core';
import { PannableDirective } from './pannable.directive';
import { PanAndZoomDirective } from './pan-and-zoom.directive';
import { ZoomableDirective } from './zoomable.directive';

@NgModule({
	declarations: [PanAndZoomDirective, PannableDirective, ZoomableDirective],
	exports: [PanAndZoomDirective, PannableDirective, ZoomableDirective],
})
export class PanAndZoomModule {}
