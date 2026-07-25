import { AfterViewInit, Component, ElementRef, HostBinding, HostListener, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

@Component({
    selector: 'image-holder',
    templateUrl: './image-holder.component.html',
    styleUrls: ['./image-holder.component.scss'],
    standalone: false
})
export class ImageHolderComponent implements OnInit, AfterViewInit, OnChanges {

	@Input() src: string;
	@Input() borderRadius: string = "6px";
	isPortrait: boolean;
	isInit: boolean;
	img: HTMLImageElement;

	@HostBinding('style.border-radius') styleBorderRadius = this.borderRadius;

	constructor(
		private el: ElementRef
	) {
	}

	ngOnInit() {
		this.isPortrait = false;
		this.isInit = true;
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (this.isInit) {
			this.ngAfterViewInit();
		}
	}

	ngAfterViewInit() {
		this.img = new Image();
		this.img.addEventListener('load', (result) => {
			const el = this.el.nativeElement;
			const elWidth = el.clientWidth;
			const elHeight = el.clientHeight;
			this.isPortrait = false;

			const imgWidth = this.img.naturalWidth;
			const imgHeight = this.img.naturalHeight;
			const calcHeight = imgHeight / elHeight;
			const calcWidth = imgWidth / calcHeight;

			if (calcWidth <= elWidth) {
				this.isPortrait = true;
			}

			if (imgHeight >= imgWidth) {
				this.isPortrait = true;
			}
		});
		this.img.src = this.src;
	}

	@HostListener('click', ['$event.target']) onClick(e) {
		var w = window.open("", '_blank');
		w.document.write(this.img.outerHTML);
		w.document.close();
	}
}
