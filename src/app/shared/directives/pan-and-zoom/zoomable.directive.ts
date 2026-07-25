import {
	Directive,
	HostBinding,
	HostListener,
	ElementRef,
	Output,
	EventEmitter,
	Renderer2,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Directive({
	selector: '[appZoomable]',
})
export class ZoomableDirective {
	@HostBinding('class.zooming') zooming = false;

	@Output() zoomIn = new EventEmitter<WheelEvent>();
	@Output() zoomOut = new EventEmitter<WheelEvent>();
	@Output() pinchIn = new EventEmitter<any>();
	@Output() pinchOut = new EventEmitter<any>();
	@Output() mouseMove = new EventEmitter<PointerEvent>();

	constructor(
		public elementRef: ElementRef,
		public sanitizer: DomSanitizer,
		public renderer: Renderer2,
	) {}

	@HostListener('mousewheel', ['$event'])
	@HostListener('onmousewheel', ['$event'])
	@HostListener('DOMMouseScroll', ['$event'])
	onMouseWheel(event: any) {
		event.stopImmediatePropagation();
		this.zooming = true;
		const delta = Math.max(
			-1,
			Math.min(1, event.wheelDelta || -event.detail),
		);
		if (delta > 0) {
			this.zoomIn.emit(event);
		} else {
			this.zoomOut.emit(event);
		}
		this.zooming = false;
	}

	@HostListener('mousemove', ['$event'])
	onMouseMove(event: PointerEvent) {
		this.mouseMove.emit(event);
	}

	@HostListener('pinch', ['$event'])
	onPinch(event: any) {
		this.zooming = true;
		if (event.scale >= 1) {
			this.pinchIn.emit(event);
		} else {
			this.pinchOut.emit(event);
		}
		this.zooming = false;
	}
}
