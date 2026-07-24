import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Route, Router, RouterStateSnapshot, UrlSegment, UrlTree } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable, of } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class UserRegistrationGuardService {

	constructor(
		private router: Router,
	) { }

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean> {
		const helper = new JwtHelperService();
		const token = route.queryParamMap.get('token');

		if (helper.isTokenExpired(token)) {
			return this.router.navigate(['/unauthorized-access'], {
				skipLocationChange: true
			});
		}

		const decodedToken = helper.decodeToken(token);
		if (decodedToken.sub !== 'user-registration-token') {
			return this.router.navigate(['/unauthorized-access'], {
				skipLocationChange: true
			});
		}

		return of(true);
	}
}
