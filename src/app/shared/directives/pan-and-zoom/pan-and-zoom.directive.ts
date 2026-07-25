import {
	Directive,
	ElementRef,
	ContentChild,
	AfterViewInit,
	Input,
} from '@angular/core';
import { PannableDirective, Position } from './pannable.directive';

@Directive({
	selector: '[appPanAndZoom]',
})
export class PanAndZoomDirective implements AfterViewInit {
	@Input() gutter = 300;
	@Input() maxScale = 2.4;
	@Input() minScale = 0.3;
	@ContentChild(PannableDirective) pannable!: PannableDirective;

	private currentMousePosition: Position = {
		x: 0,
		y: 0,
	};

	constructor(private elementRef: ElementRef) {}

	ngAfterViewInit(): void {
		this.pannable.ready.subscribe(() => {
			// setTimeout(() => {
			this.centerPannable();
			// })
		});

		this.pannable.mouseMove.subscribe((event: PointerEvent) => {
			this.setCurrentMousePosition(event);
		});

		this.pannable.panMove.subscribe(() => {
			// const currentPosition: Position = this.pannable.getPosition();
			// const newPosition: Position = {
			// 	x: Math.max(Math.min(currentPosition.x, this.gutter), -(diffRefWidth + this.gutter)),
			// 	y: Math.max(Math.min(currentPosition.y, this.gutter), -(diffRefHeight + this.gutter))
			// };
			// this.pannable.setPosition(newPosition);
		});

		this.pannable.zoomIn.subscribe(() => {
			this.zoomIn(this.currentMousePosition);
		});

		this.pannable.zoomOut.subscribe(() => {
			this.zoomOut(this.currentMousePosition);
		});

		this.pannable.pinchIn.subscribe((event: any) => {
			this.zoomIn(event.center);
		});

		this.pannable.pinchOut.subscribe((event: any) => {
			this.zoomOut(event.center);
		});
	}

	zoom(center: Position, factor: number) {
		const scale = this.pannable.getScale();
		const newScale = scale * factor;
		if (newScale > this.maxScale || newScale < this.minScale) {
			return;
		}

		this.pannable.setScale(newScale);

		const newPosition = {
			x:
				this.getPannablePosition().x -
				(center.x - this.getPannableRect().x) * (factor - 1),
			y:
				this.getPannablePosition().y -
				(center.y - this.getPannableRect().y) * (factor - 1),
		};

		this.pannable.setPosition(newPosition);
	}

	zoomIn(center: Position) {
		this.zoom(center, 1.1);
	}

	zoomOut(center: Position) {
		this.zoom(center, 0.9);
	}

	getPannablePosition(): Position {
		return this.pannable.getPosition();
	}

	getPannableRect(): DOMRect {
		return this.pannable.elementRef.nativeElement.getBoundingClientRect();
	}

	centerPannable() {
		const pannableRef = this.pannable.elementRef;
		const pannableRefWidth = pannableRef.nativeElement.clientWidth;
		const pannableRefHeight = pannableRef.nativeElement.clientHeight;

		this.movePannable({
			x: pannableRefWidth / 2,
			y: pannableRefHeight / 2,
		});
	}

	movePannable(position: Position) {
		const scale = this.pannable.getScale();
		const containerRef = this.elementRef;
		const containerRefWidth = containerRef.nativeElement.clientWidth;
		const containerRefHeight = containerRef.nativeElement.clientHeight;

		const newPosition = {
			x: containerRefWidth / 2 - position.x * scale,
			y: containerRefHeight / 2 - position.y * scale,
		};
		this.pannable.setPosition(newPosition);
	}

	setCurrentMousePosition(event: PointerEvent) {
		this.currentMousePosition.x = event.x;
		this.currentMousePosition.y = event.y;
	}
}
