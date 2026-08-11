import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { SessionService } from 'src/app/core/services/session.service';
import { MainService } from './main.service';

export const MainGuard: CanActivateFn = (
	route,
	state,
): boolean | UrlTree | Observable<boolean | UrlTree> => {
	const sessionService = inject(SessionService);
	const mainService = inject(MainService);
	const router = inject(Router);

	if (!sessionService.isAuth()) {
		return router.createUrlTree(['/auth/login'], {
			queryParams: {
				returnUrl: state.url,
			},
		});
	}

	if (sessionService.hasAccessLoaded()) {
		return true;
	}

	return mainService.getUserSession().pipe(
		tap((response) => {
			sessionService.setUser(response.user);

			sessionService.setAccess(
				response.roleCodes ?? [],
				response.permissionCodes ?? [],
			);

			sessionService.setMenus(response.menus ?? []);
			mainService.setMenus(response.menus ?? []);
		}),
		map(() => true),
		catchError((error) => {
			console.error(
				'Failed to initialize access before route activation',
				error,
			);

			return of(
				router.createUrlTree(['/auth/login'], {
					queryParams: {
						returnUrl: state.url,
						reason: 'session-expired',
					},
				}),
			);
		}),
	);
};
