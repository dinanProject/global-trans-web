import { Injectable } from '@angular/core';
import { MatDrawerMode } from '@angular/material/sidenav';
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
	toolbarTitle!: string;
	toolbarSubtitle!: string;
	breadcrumbs: any;
	isMobile!: boolean;

	constructor(private apiService: ApiService) {}

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

	setSidebarMode(mode: MatDrawerMode): void {
		this.sidebarMode = mode;
	}

	getSidebarMode(): MatDrawerMode {
		return this.sidebarMode;
	}

	setToolbarTitle(title: string) {
		this.toolbarTitle = title;
	}

	getToolbarTitle(): string {
		return this.toolbarTitle;
	}

	setToolbarSubtitle(subtitle: string) {
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

	getUser() {
		return this.apiService.get('/backend');
	}
}
