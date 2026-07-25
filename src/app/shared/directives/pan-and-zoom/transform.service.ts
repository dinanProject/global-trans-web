import { Injectable } from '@angular/core';
import { Position } from './pannable.directive';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

@Injectable({
	providedIn: 'root'
})
export class TransformService {

	position: Position = {
		x: 0,
		y: 0
	};

	scale = 1;

	constructor(
		private sanitizer: DomSanitizer
	) { }

	transformPosition(position: Position): SafeStyle {
		this.position = position;
		console.log(`transformPosition`);
		return this.sanitizer.bypassSecurityTrustStyle(
			`translateX(${this.position.x}px) translateY(${this.position.y}px)`
		);
	}

	transformScale(position: Position, scale: number): SafeStyle {
		this.scale = scale;
		this.position = position;
		console.log(`transformScale`);
		return this.sanitizer.bypassSecurityTrustStyle(
			`translateX(${this.position.x}px) translateY(${this.position.y}px) scale(${this.scale})`
		);
	}
}
