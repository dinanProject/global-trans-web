import { Injectable } from '@angular/core';
import { CanLoad, Route, UrlSegment, UrlTree, Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { SessionService } from 'src/app/services/session.service';

@Injectable({
	providedIn: 'root'
})
export class BackendGuardService implements CanActivate, CanLoad {

	menu = 'web.backend';

	constructor(
		private router: Router,
		private sessionService: SessionService
	) { }

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean> {

		if (!this.sessionService.isAuth()) {
			console.log('Not auth');
			const returnUrl = state.url;
			return this.router.navigate(['/auth/login'], {
				queryParams: { returnUrl }
			});
		}

		return this.checkTokenExpiration()
			.pipe(
				switchMap(() => {
					if (!this.sessionService.hasMn(this.menu)) {
						console.log('Dont have menu', this.menu);
						return of(this.router.createUrlTree(['/unauthorized-access']));
					}
					return of(true);
				})
			);
	}

	canLoad(route: Route, segments: UrlSegment[]): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {

		if (!this.sessionService.isAuth()) {
			console.log('Not auth');
			const returnUrl = segments.reduce((path, currentSegment) => {
				return `${path}/${currentSegment.path}`;
			}, '');

			return this.router.navigate(['/auth/login'], {
				queryParams: {
					returnUrl
				}
			});
		}

		return this.checkTokenExpiration()
			.pipe(
				switchMap(() => {
					if (!this.sessionService.hasMn(this.menu)) {
						console.log('Dont have menu', this.menu);
						return of(this.router.createUrlTree(['/unauthorized-access']));
					}
					return of(true);
				})
			);
	}

	checkTokenExpiration() {
		return new Observable((observer) => {
			if (!this.sessionService.isTokenExpired()) {
				observer.next();
			} else {
				this.sessionService.refreshToken()
					.subscribe(() => {
						observer.next();
					});
			}
		});
	}

}
