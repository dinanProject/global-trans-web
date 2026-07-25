import { Directive, HostListener, Renderer2, ElementRef, Input, Output, EventEmitter, OnInit } from '@angular/core';

@Directive({
	// tslint:disable-next-line:directive-selector
	selector: '[panZoom]'
})
export class PanZoomDirective implements OnInit {
	@Input() scale = 1;
	@Input() x;
	@Input() y;
	@Input() gutter = 100;
	@Output() locationChanged = new EventEmitter<any>();

	@Input() noZoom: boolean;

	@Input() panZoom = true;
	@Output() startDrag = new EventEmitter<any>();
	@Output() endDrag = new EventEmitter<any>();

	startX = 0;
	startY = 0;
	lastScale = 1;

	constructor(
		private el: ElementRef,
		private renderer: Renderer2) {
	}

	ngOnInit(): void {
		console.log('panzoom on init');
		// this.move();
	}

	@HostListener('mousewheel', ['$event']) onMouseWheelChrome(event: any) {
		this.mouseWheelFunc(event);
	}

	@HostListener('DOMMouseScroll', ['$event']) onMouseWheelFirefox(event: any) {
		this.mouseWheelFunc(event);
	}

	@HostListener('onmousewheel', ['$event']) onMouseWheelIE(event: any) {
		this.mouseWheelFunc(event);
	}

	@HostListener('mousedown', ['$event']) protected onMouseDown(event) {
		event.preventDefault();
	}

	@HostListener('panstart', ['$event']) protected onPanStart(event) {
		console.log('panStart');
		if (!this.panZoom) {
			return;
		}
		// event.preventDefault();
		this.startX = this.x;
		this.startY = this.y;
		this.startDrag.emit();
	}

	@HostListener('panmove', ['$event']) protected onPanMove(event) {
		console.log('panMove');
		if (!this.panZoom) {
			console.log('not pan zoom');
			return;
		}

		const x = this.startX + event.deltaX;
		const y = this.startY + event.deltaY;

		const elWidth = this.el.nativeElement.clientWidth;
		const elParentWidth = this.el.nativeElement.parentElement.clientWidth;
		const width = elWidth - elParentWidth;

		const elHeight = this.el.nativeElement.clientHeight;
		const elParentHeight = this.el.nativeElement.parentElement.clientHeight;
		const height = elHeight - elParentHeight;

		if (x > this.gutter) {
			this.x = this.gutter;
		} else {
			if (x < -Math.abs(width + this.gutter)) {
				this.x = -Math.abs(width + this.gutter);
			} else {
				this.x = x;
			}
		}

		if (y > this.gutter) {
			this.y = this.gutter;
		} else {
			if (y < -Math.abs(height + this.gutter)) {
				this.y = -Math.abs(height + this.gutter);
			} else {
				this.y = y;
			}

		}

		this.move();
		this.locationChanged.emit({ x: this.x, y: this.y });
	}

	@HostListener('panend', ['$event']) protected onPanEnd(event) {
		if (!this.panZoom) {
			return;
		}
		this.endDrag.emit();
	}

	mouseWheelFunc(event: any) {
		if (this.panZoom && !this.noZoom) {
			const e = window.event || event; // old IE support
			console.log('e', e);
			const delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));

			if (delta > 0) {
				if (this.scale < 2) {
					this.scale += 0.1;
				}
			} else {
				if (this.scale > 0.2) {
					this.scale += -0.1;
				}
			}

			console.log(event.offsetX, event.offsetY);
			this.renderer.setStyle(this.el.nativeElement, 'transform-origin', event.offsetX + 'px ' + event.offsetY + 'px');
			this.renderer.setStyle(this.el.nativeElement, 'transform', 'scale(' + this.scale + ')');
		}
	}

	@HostListener('pinch', ['$event']) protected onPinch(event) {
		if (this.panZoom && !this.noZoom) {
			if (event.scale >= 1) {
				if (this.scale < 2) {
					this.scale += 0.1;
				}
			} else {
				if (this.scale > 0.3) {
					this.scale += -0.1;
				}
			}
			this.renderer.setStyle(this.el.nativeElement, 'transform', 'scale(' + this.scale + ')');
		}
	}

	@HostListener('zoomedIn') zoomedIt(asd) {
		console.log('zoomedIn', asd);
		if (this.scale < 2) {
			this.scale += 0.1;
		}
		this.renderer.setStyle(this.el.nativeElement, 'transform', 'scale(' + this.scale + ')');
	}

	@HostListener('zoomedOut') zoomedOut(asd) {
		console.log('zoomedOut', asd);
		if (this.scale > 0.2) {
			this.scale += -0.1;
		}
		this.renderer.setStyle(this.el.nativeElement, 'transform', 'scale(' + this.scale + ')');
	}

	move() {
		this.el.nativeElement.style.top = this.y + 'px';
		this.el.nativeElement.style.left = this.x + 'px';
	}

	// center() {
	// 	const elWidth = this.el.nativeElement.clientWidth;
	// 	const elParentWidth = this.el.nativeElement.parentElement.clientWidth;

	// 	const elHeight = this.el.nativeElement.clientHeight;
	// 	const elParentHeight = this.el.nativeElement.parentElement.clientHeight;

	// 	console.log('elWidth', elWidth);
	// 	console.log('elParentWidth', elParentWidth);
	// 	console.log('elHeight', elHeight);
	// 	console.log('elParentHeight', elParentHeight);
	// 	this.x = (elParentWidth / 2) - (elWidth / 2);
	// 	this.y = (elParentHeight / 2) - (elHeight / 2);
	// 	this.move();
	// 	// console.log('parent', parentNode);
	// 	// console.log('parentWidth', parentNode.offsetWidth);
	// 	// console.log('parentHeight', parentNode.offsetHeight);
	// }
}
