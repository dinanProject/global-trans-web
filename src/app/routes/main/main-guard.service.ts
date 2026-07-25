import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';

import { SessionService } from 'src/app/core/services/session.service';

@Injectable({
	providedIn: 'root',
})
export class MainGuardService  {
	constructor(
		private sessionService: SessionService,
		private router: Router,
	) {}

	canActivate(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot,
	): boolean | UrlTree {
		return this.checkAuthentication(state.url);
	}

	canActivateChild(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot,
	): boolean | UrlTree {
		return this.checkAuthentication(state.url);
	}

	private checkAuthentication(returnUrl: string): boolean | UrlTree {
		if (this.sessionService.isAuth()) {
			return true;
		}

		return this.router.createUrlTree(['/auth/login'], {
			queryParams: {
				returnUrl,
			},
		});
	}
}
