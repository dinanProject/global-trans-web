import { inject } from '@angular/core';
import {
	ActivatedRouteSnapshot,
	CanActivateFn,
	Router,
	RouterStateSnapshot,
	UrlTree,
} from '@angular/router';

import { SessionService } from '../services/session.service';

export const PermissionGuard: CanActivateFn = (
	route: ActivatedRouteSnapshot,
	state: RouterStateSnapshot,
): boolean | UrlTree => {
	const sessionService = inject(SessionService);
	const router = inject(Router);

	const permission = String(route.data['permission'] ?? '').trim();

	if (!permission || sessionService.hasPermission(permission)) {
		return true;
	}

	return router.createUrlTree(['/unauthorized'], {
		queryParams: {
			permission,
			returnUrl: state.url,
		},
	});
};
