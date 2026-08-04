import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
	selector: 'app-not-found',
	templateUrl: './not-found.component.html',
	styleUrls: ['./not-found.component.scss'],
	standalone: false,
})
export class NotFoundComponent {
	readonly requestedUrl: string;

	constructor(
		private readonly location: Location,
		private readonly router: Router,
	) {
		this.requestedUrl = this.getRequestedUrl();
	}

	goBack(): void {
		if (window.history.length > 1) {
			this.location.back();
			return;
		}

		this.goHome();
	}

	goHome(): void {
		void this.router.navigate(['/home']);
	}

	private getRequestedUrl(): string {
		const currentUrl = this.router.url.split('?')[0].split('#')[0];

		if (!currentUrl || currentUrl === '/') {
			return '/';
		}

		return currentUrl;
	}
}
