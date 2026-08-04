import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
	selector: 'app-unauthorized',
	templateUrl: './unauthorized.component.html',
	styleUrls: ['./unauthorized.component.scss'],
	standalone: false,
})
export class UnauthorizedComponent {
	readonly requestedUrl: string;
	readonly requiredPermission: string;

	constructor(
		private readonly location: Location,
		private readonly router: Router,
		private readonly activatedRoute: ActivatedRoute,
	) {
		this.requestedUrl =
			this.activatedRoute.snapshot.queryParamMap.get('returnUrl') ||
			this.activatedRoute.snapshot.queryParamMap.get('url') ||
			'Restricted resource';

		this.requiredPermission =
			this.activatedRoute.snapshot.queryParamMap.get('permission') || '';
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
}
