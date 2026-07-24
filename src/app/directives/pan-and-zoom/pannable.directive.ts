import { Directive, HostListener, Output, EventEmitter, HostBinding, ElementRef, AfterViewInit, Renderer2 } from '@angular/core';
import { SafeStyle, DomSanitizer } from '@angular/platform-browser';
import { TransformService } from './transform.service';
import ResizeObserver from 'resize-observer-polyfill';
import { ZoomableDirective } from './zoomable.directive';

export interface Position {
	x: number;
	y: number;
}

export interface Size {
	width: number;
	height: number;
}

@Directive({
	selector: '[appPannable]'
})
export class PannableDirective extends ZoomableDirective implements AfterViewInit {

	@HostBinding('class.pannable') pannable = true;
	@HostBinding('class.panning') panning = false;

	@HostBinding('style.transform') get transform(): SafeStyle {
		return this.sanitizer.bypassSecurityTrustStyle(
			`translateX(${this.position.x}px) translateY(${this.position.y}px) scale(${this.scale})`
		);
	}

	@HostBinding('style.transform-origin') get transformOrigin(): SafeStyle {
		return this.sanitizer.bypassSecurityTrustStyle(
			`${this.origin.x}px ${this.origin.y}px`
		);
	}

	@Output() init = new EventEmitter();
	@Output() panStart = new EventEmitter<PannableDirective>();
	@Output() panMove = new EventEmitter<PannableDirective>();
	@Output() panEnd = new EventEmitter<PannableDirective>();
	@Output() ready = new EventEmitter<PannableDirective>();

	private startPosition: Position = { x: 0, y: 0 };
	protected position: Position = this.startPosition;
	protected scale = 1;
	protected origin: Position = { x: 0, y: 0 };

	constructor(
		public elementRef: ElementRef,
		public sanitizer: DomSanitizer,
		public renderer: Renderer2
	) {
		super(elementRef, sanitizer, renderer);
	}

	ngAfterViewInit(): void {
		new ResizeObserver(() => {
			console.log('ready!');
			this.ready.emit(this);
		}).observe(this.elementRef.nativeElement);
	}

	@HostListener('panstart', ['$event'])
	onPanStart(event) {
		console.log('panStart');
		this.panning = true;
		this.startPosition = {
			x: this.position.x + event.deltaX,
			y: this.position.y + event.deltaY
		};
		this.panStart.emit(this);
	}

	@HostListener('panmove', ['$event'])
	onPanMove(event) {
		this.setPosition({
			x: this.startPosition.x + event.deltaX,
			y: this.startPosition.y + event.deltaY
		});

		this.panMove.emit(this);
	}

	@HostListener('panend', ['$event'])
	onPanEnd(event) {
		this.panning = false;
		this.panEnd.emit(this);
	}

	setPosition(position: Position) {
		// console.log('pannable setPosition', position);
		this.position = position;
	}

	getPosition(): Position {
		return this.position;
	}

	setScale(scale: number) {
		this.scale = scale;
	}

	getScale() {
		return this.scale;
	}
}
