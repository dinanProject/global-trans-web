import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';

import { SessionService } from 'src/app/core/services/session.service';

export const MainGuard: CanActivateFn = (route, state): boolean | UrlTree => {
	const sessionService = inject(SessionService);
	const router = inject(Router);

	if (sessionService.isAuth()) {
		return true;
	}

	return router.createUrlTree(['/auth/login'], {
		queryParams: {
			returnUrl: state.url,
		},
	});
};
