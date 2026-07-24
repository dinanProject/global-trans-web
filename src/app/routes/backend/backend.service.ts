import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { ApiService } from 'src/app/services/api.service';
import { Menu } from './menu.component';

export interface Breadcrumb {
	label: string;
	path: string;
}

@Injectable({
	providedIn: 'root'
})
export class BackendService {

	sidebarOpened = true;
	sidebarMode: 'side' | 'over' = 'side';
	toolbarTitle: string;
	toolbarSubtitle: string;
	breadcrumbs: any;
	isMobile: boolean;

	constructor(
		private apiService: ApiService
	) { }

	toggleSidebar() {
		this.sidebarOpened = !this.sidebarOpened;
	}

	hideSidebar() {
		return new Promise<void>((resolve, reject) => {
			setTimeout(() => {
				this.sidebarOpened = false;
				setTimeout(() => {
					resolve();
				}, 300);
			});
		});
	}

	showSidebar() {
		return new Promise<void>((resolve, reject) => {
			setTimeout(() => {
				this.sidebarOpened = true;
				setTimeout(() => {
					resolve();
				}, 300);
			});
		});
	}

	isSidebarOpened(): boolean {
		return this.sidebarOpened;
	}

	setSidebarMode(mode: 'side' | 'over') {
		this.sidebarMode = mode;
	}

	getSidebarMode(): string {
		return this.sidebarMode;
	}

	setToolbarTitle(title: string) {
		this.toolbarTitle = title;
	}

	getToolbarTitle(): string {
		return this.toolbarTitle;
	}

	setToolbarSubtitle(subtitle) {
		this.toolbarSubtitle = subtitle;
	}

	getToolbarSubtitle(): string {
		return this.toolbarSubtitle;
	}

	setBreadcrumbs(breadcrumbs: Breadcrumb[]) {
		this.breadcrumbs = breadcrumbs;
	}

	getBreadcrumbs(): Breadcrumb[] {
		return this.breadcrumbs;
	}

	// menuTree(menus: Array<Menu>, parentId: number = 0, level: number = -1): Array<Menu> {
	// 	const _menus: Array<Menu> = [];
	// 	for (const menu of menus) {
	// 		if (menu.parentId === parentId) {
	// 			menu.level = level;
	// 			menu.child = this.menuTree(menus, menu.menuId, level + 1);
	// 			menu.visibility = menu.child.length > 0 ? 'collapsed' : 'no-child';
	// 			_menus.push(menu);
	// 		}
	// 	}
	// 	return _menus;
	// }

	getUser() {
		return this.apiService.get('/backend')
	}

	// getMenus(): Observable<any> {
	// 	return this.apiService.get('/backend/menu');
	// 	// .pipe(
	// 	// 	switchMap((result) => {
	// 	// 		console.log(result);
	// 	// 		const menus = this.menuTree(result, 4);
	// 	// 		console.log('menus', menus);
	// 	// 		if (menus.length === 0) {
	// 	// 			return of({
	// 	// 				status: 'unauthorized',
	// 	// 				data: []
	// 	// 			});
	// 	// 		}
	// 	// 		// return of({
	// 	// 		// 	status: 'authorized',
	// 	// 		// 	data: menus
	// 	// 		// });
	// 	// 		return menus;
	// 	// 	})
	// 	// catchError((err: any, caught) => {
	// 	// 	console.log('err', err);
	// 	// 	if (err.status == 401) {
	// 	// 		return of({
	// 	// 			status: 'unauthenticated',
	// 	// 			data: []
	// 	// 		});
	// 	// 	} else {
	// 	// 		return of({
	// 	// 			status: 'unknown-error',
	// 	// 			data: null
	// 	// 		});
	// 	// 	}
	// 	// })
	// 	// );
	// }
}
