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

	markMenuNotificationAsRead(
		referenceUuid: string,
		menuPermissionCode: string,
	): Observable<{ updatedCount: number }> {
		return this.apiService.post(
			`/menu-notification/reference/${referenceUuid}/read`,
			{ menuPermissionCode },
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
