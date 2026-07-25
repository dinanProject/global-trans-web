import { Component, OnInit, HostBinding, Input, AfterViewInit, ElementRef } from '@angular/core';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'thumb',
    templateUrl: './thumb.component.html',
    styleUrls: ['./thumb.component.scss'],
    standalone: false
})
export class ThumbComponent implements OnInit, AfterViewInit {

	@Input() height: string;
	@Input() src: string;

	isPortrait: boolean;

	@HostBinding('style.height') hostHeight: string;

	constructor(
		private el: ElementRef
	) {
	}

	ngOnInit() {
		// console.log(this.height);
		this.hostHeight = this.height;
		this.isPortrait = false;
	}

	ngAfterViewInit() {
		const img = new Image();
		img.addEventListener('load', (result) => {
			const el = this.el.nativeElement;
			const elWidth = el.clientWidth;
			const elHeight = el.clientHeight;
			this.isPortrait = false;

			// console.log('el width x el height', elWidth, elHeight);
			// if (img.naturalWidth > 300) {
			// 	console.table({
			// 		path: img.src,
			// 		dimension: img.naturalWidth + ' x ' + img.naturalHeight
			// 	});
			// }

			const imgWidth = img.naturalWidth;
			const imgHeight = img.naturalHeight;

			const calcHeight = imgHeight / elHeight;
			// console.log('calcHeight', calcHeight);
			// console.log('calcHeight2', Math.round(imgHeight / calcHeight));

			const calcWidth = imgWidth / calcHeight;
			// console.log('elHeight', elHeight);
			// console.log('elWidth', elWidth);
			// console.log('imgWidth', imgWidth);
			// console.log('calcWidth', calcWidth);

			if (calcWidth <= elWidth) {
				this.isPortrait = true;
			}

			if (imgHeight >= imgWidth) {
				this.isPortrait = true;
			}
		});
		img.src = this.src;
	}

}
