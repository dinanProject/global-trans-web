import { Injectable } from '@angular/core';
import { MatDrawerMode } from '@angular/material/sidenav';
import { BehaviorSubject, Observable } from 'rxjs';

import { MainBootstrapResponse } from 'src/app/core/models/main-bootstrap.model';
import { Menu } from 'src/app/core/models/menu.model';
import { ApiService } from 'src/app/core/services/api.service';

export interface Breadcrumb {
	label: string;
	path: string;
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
			next: (response: MainBootstrapResponse) => {
				console.log('Refreshing sidebar menus', response.menus);
				this.setMenus(response.menus ?? []);
			},
			error: (error: unknown) => {
				console.error('Failed to refresh sidebar menus', error);
			},
		});
	}

	getUser(): Observable<MainBootstrapResponse> {
		return this.apiService.get('/backend');
	}

	getMenus(): Observable<Menu[]> {
		return this.apiService.get('/menu');
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
