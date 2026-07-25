import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { MediaChange, MediaObserver } from '@angular/flex-layout';
import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { User } from 'src/app/core/models/user.model';
import { SessionService } from 'src/app/core/services/session.service';
import { Breadcrumb, MainService } from './main.service';
import { MatDrawerMode } from '@angular/material/sidenav';

@Component({
    selector: 'app-main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss'],
    standalone: false
})
export class MainComponent implements OnInit, OnDestroy {
	user: User | null = null;
	currentUrl = '';

	private mediaSubscription?: Subscription;
	private routerSubscription?: Subscription;
	private titleSubscription?: Subscription;

	constructor(
		private mainService: MainService,
		private titleService: Title,
		private sessionService: SessionService,
		private media: MediaObserver,
		private router: Router,
	) {
		this.initSidebarEvents();
		this.initToolbarTitle();
	}

	ngOnInit(): void {
		this.user = this.sessionService.getUser();
		this.titleService.setTitle('Global Trans');
	}

	ngOnDestroy(): void {
		this.mediaSubscription?.unsubscribe();
		this.routerSubscription?.unsubscribe();
		this.titleSubscription?.unsubscribe();
	}

	private initSidebarEvents(): void {
		this.mediaSubscription = this.media
			.asObservable()
			.pipe(
				filter((changes: MediaChange[]) => changes.length > 0),
				map((changes: MediaChange[]) => changes[0]),
			)
			.subscribe((change: MediaChange) => {
				const isDesktop =
					change.mqAlias === 'lg' || change.mqAlias === 'xl';

				this.mainService.isMobile = !isDesktop;

				if (isDesktop) {
					this.mainService.showSidebar();
					this.mainService.setSidebarMode('side');
					return;
				}

				this.mainService.hideSidebar();
				this.mainService.setSidebarMode('over');
			});

		this.routerSubscription = this.router.events.subscribe((event) => {
			if (
				event instanceof NavigationStart &&
				this.mainService.getSidebarMode() === 'over'
			) {
				this.mainService.hideSidebar();
			}
		});
	}

	private initToolbarTitle(): void {
		this.titleSubscription = this.router.events
			.pipe(filter((event) => event instanceof NavigationEnd))
			.subscribe(() => {
				this.currentUrl = this.router.url.split('?')[0];

				let route = this.router.routerState.snapshot.root;

				const breadcrumbs: Breadcrumb[] = [];
				let routePath = '';

				while (route.firstChild) {
					route = route.firstChild;

					const routeUrl = route.url
						.map((segment) => segment.path)
						.join('/');

					if (routeUrl) {
						routePath += `/${routeUrl}`;
					}

					const data = route.data;

					if (data?.title) {
						this.mainService.setToolbarTitle(data.title);
					}

					if (data?.subtitle) {
						this.mainService.setToolbarSubtitle(data.subtitle);

						breadcrumbs.push({
							label: data.subtitle,
							path: routePath,
						});
					}
				}

				this.mainService.setBreadcrumbs(breadcrumbs);
			});
	}

	toggleSidebar(): void {
		this.mainService.toggleSidebar();
	}

	getSidebarMode(): MatDrawerMode {
		return this.mainService.getSidebarMode();
	}

	isSidebarOpened(): boolean {
		return this.mainService.isSidebarOpened();
	}

	getToolbarTitle(): string {
		return this.mainService.getToolbarTitle();
	}

	getToolbarSubtitle(): string {
		return this.mainService.getToolbarSubtitle();
	}

	getBreadcrumbs(): Breadcrumb[] {
		return this.mainService.getBreadcrumbs();
	}

	logout(): void {
		this.sessionService.logoutLocal();
		this.router.navigate(['/auth/login']);
	}
}
