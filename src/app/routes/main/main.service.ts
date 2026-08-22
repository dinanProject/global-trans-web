import { Injectable } from '@angular/core';
import { MatDrawerMode } from '@angular/material/sidenav';
import { BehaviorSubject, Observable } from 'rxjs';

import { UserSessionResponse } from 'src/app/core/models/user-session.model';
import { Menu } from 'src/app/core/models/menu.model';
import { ApiService } from 'src/app/core/services/api.service';

export interface Breadcrumb {
	label: string;
	path: string;
}

export interface MenuUnreadNotificationState {
	unreadCount: number;
	latestReferenceUuid: string | null;
	unreadReferenceUuids: string[];
}

export type MenuUnreadCounts = Record<string, MenuUnreadNotificationState>;

export interface ChangePasswordPayload {
	currentPassword: string;
	newPassword: string;
	confirmPassword: string;
}

@Injectable({
	providedIn: 'root',
})
export class MainService {
	sidebarOpened = true;
	sidebarMode: MatDrawerMode = 'side';

	toolbarTitle: string = '';
	toolbarSubtitle = '';
	breadcrumbs: Breadcrumb[] = [];
	isMobile = false;

	private readonly menusSubject = new BehaviorSubject<Menu[]>([]);
	readonly menus$ = this.menusSubject.asObservable();

	constructor(private readonly apiService: ApiService) {}

	setMenus(menus: Menu[]): void {
		this.menusSubject.next(menus);
	}

	refreshMenus(): void {
		this.getUser().subscribe({
			next: (response: UserSessionResponse) => {
				this.setMenus(response.menus ?? []);
			},
			error: (error: unknown) => {
				console.error('Failed to refresh sidebar menus', error);
			},
		});
	}

	getUser(): Observable<UserSessionResponse> {
		return this.apiService.get('/user-session');
	}

	getMenus(): Observable<Menu[]> {
		return this.apiService.get('/menu');
	}

	getMenuUnreadCounts(): Observable<MenuUnreadCounts> {
		return this.apiService.get('/menu-notification/unread-counts');
	}

	refreshMenuUnreadCounts(): void {
		this.getMenuUnreadCounts().subscribe({
			next: (unreadCounts) => {
				this.setMenus(
					this.applyMenuUnreadCounts(
						this.menusSubject.value,
						unreadCounts,
					),
				);
			},
			error: (error: unknown) => {
				console.error(
					'Failed to refresh menu notification counts',
					error,
				);
			},
		});
	}

	private applyMenuUnreadCounts(
		menus: Menu[],
		unreadCounts: MenuUnreadCounts,
	): Menu[] {
		return (menus ?? []).map((menu) => {
			const child = this.applyMenuUnreadCounts(
				menu.child ?? [],
				unreadCounts,
			);
			const childUnreadCount = child.reduce(
				(total, item) => total + Number(item.unreadCount ?? 0),
				0,
			);

			return {
				...menu,
				unreadCount:
					child.length > 0
						? childUnreadCount
						: Number(unreadCounts[menu.code]?.unreadCount ?? 0),
				unreadReferenceUuids:
					child.length > 0
						? []
						: (unreadCounts[menu.code]?.unreadReferenceUuids ?? []),
				child,
			};
		});
	}

	markMenuNotificationAsRead(
		referenceUuid: string,
		menuPermissionCode: string,
		menuCode?: string | null,
	): Observable<{ updatedCount: number }> {
		return this.apiService.post(
			`/menu-notification/reference/${referenceUuid}/read`,
			{ menuPermissionCode, menuCode },
		);
	}

	getUserSession(): Observable<UserSessionResponse> {
		return this.apiService.get('/user-session');
	}

	changePassword(payload: ChangePasswordPayload): Observable<void> {
		return this.apiService.put('/auth/change-password', payload);
	}

	toggleSidebar(): void {
		this.sidebarOpened = !this.sidebarOpened;
	}

	hideSidebar(): Promise<void> {
		return new Promise<void>((resolve) => {
			setTimeout(() => {
				this.sidebarOpened = false;
				resolve();
			});
		});
	}

	showSidebar(): Promise<void> {
		return new Promise<void>((resolve) => {
			setTimeout(() => {
				this.sidebarOpened = true;
				resolve();
			});
		});
	}

	isSidebarOpened(): boolean {
		return this.sidebarOpened;
	}

	setSidebarMode(mode: MatDrawerMode): void {
		this.sidebarMode = mode;
	}

	getSidebarMode(): MatDrawerMode {
		return this.sidebarMode;
	}

	setToolbarTitle(title: string): void {
		this.toolbarTitle = title;
	}

	getToolbarTitle(): string {
		return this.toolbarTitle;
	}

	setToolbarSubtitle(subtitle: string): void {
		this.toolbarSubtitle = subtitle;
	}

	getToolbarSubtitle(): string {
		return this.toolbarSubtitle;
	}

	setBreadcrumbs(breadcrumbs: Breadcrumb[]): void {
		this.breadcrumbs = breadcrumbs;
	}

	getBreadcrumbs(): Breadcrumb[] {
		return this.breadcrumbs;
	}
}
