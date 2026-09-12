import {
	Component,
	HostListener,
	OnDestroy,
	OnInit,
	QueryList,
	ViewChildren,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import {
	ActivatedRoute,
	NavigationEnd,
	NavigationStart,
	Router,
} from '@angular/router';
import { MatDrawerMode } from '@angular/material/sidenav';
import { MediaChange, MediaObserver } from '@angular/flex-layout';
import { EMPTY, fromEvent, merge, Subscription, timer } from 'rxjs';
import { catchError, exhaustMap, filter, map } from 'rxjs/operators';

import { User } from 'src/app/core/models/user.model';
import { SessionService } from 'src/app/core/services/session.service';

import { MenuComponent } from './menu/menu.component';
import { Breadcrumb, MainService, MenuUnreadCounts } from './main.service';
import { UserSessionResponse } from 'src/app/core/models/user-session.model';
import { Menu } from 'src/app/core/models/menu.model';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ChangePasswordDialogComponent } from './header-bar/change-password-dialog.component';

@Component({
	selector: 'app-main',
	templateUrl: './main.component.html',
	styleUrls: ['./main.component.scss'],
	standalone: false,
})
export class MainComponent implements OnInit, OnDestroy {
	user: User | null = null;
	menus: Menu[] = [];
	isMenuLoading = true;

	currentUrl = '';

	selectedMenuIndex = 0;
	isMenuFiltering = false;
	filteredMenuComponents: MenuComponent[] = [];

	@ViewChildren(MenuComponent)
	menuComponents!: QueryList<MenuComponent>;

	private readonly subscriptions = new Subscription();

	constructor(
		private readonly activatedRoute: ActivatedRoute,
		private readonly mainService: MainService,
		private readonly titleService: Title,
		private readonly sessionService: SessionService,
		private readonly media: MediaObserver,
		private readonly router: Router,
		private readonly dialog: MatDialog,
		private readonly snackBar: MatSnackBar,
	) {
		this.initSidebarEvents();
		this.initToolbarTitle();
	}

	ngOnInit(): void {
		this.titleService.setTitle('Global Trans');

		this.user = this.sessionService.getUser();
		this.currentUrl = this.getCurrentUrl();

		this.mainService.setToolbarTitle('');
		this.mainService.setToolbarSubtitle('');

		this.initMenus();
		this.mainService.setMenus(this.sessionService.getMenus());

		this.loadMainDataIfNeeded();
		this.initMenuUnreadRefreshNotifications();
		this.initMenuNotificationPolling();
	}

	private initMenus(): void {
		const subscription = this.mainService.menus$.subscribe((menus) => {
			this.menus = this.normalizeMenus(menus ?? []);
		});

		this.subscriptions.add(subscription);
	}

	private loadMainDataIfNeeded(): void {
		const user = this.sessionService.getUser();
		const menus = this.sessionService.getMenus();

		if (user) {
			this.user = user;
		}

		if (menus.length > 0) {
			this.mainService.setMenus(menus);
		}

		if (
			user &&
			(this.sessionService.getRoleCodes().length > 0 ||
				this.sessionService.getPermissionCodes().length > 0)
		) {
			this.isMenuLoading = false;
			this.mainService.refreshMenus();
			return;
		}

		this.loadMainData();
	}

	private initMenuUnreadRefreshNotifications(): void {
		const subscription =
			this.mainService.menuUnreadCountsRefreshed$.subscribe(
				(unreadCounts: MenuUnreadCounts) => {
					const updatedMenus = this.applyMenuUnreadCounts(
						this.menus,
						unreadCounts,
					);

					this.showNewWorkNotifications(
						this.menus,
						updatedMenus,
						unreadCounts,
					);
				},
			);

		this.subscriptions.add(subscription);
	}

	private initMenuNotificationPolling(): void {
		const subscription = merge(
			timer(0, 30_000),
			fromEvent(document, 'visibilitychange'),
			fromEvent(window, 'focus'),
		)
			.pipe(
				filter(() => !document.hidden),
				exhaustMap(() =>
					this.mainService.getMenuUnreadCounts().pipe(
						catchError((error: unknown) => {
							console.error(
								'Failed to refresh menu notification counts',
								error,
							);

							return EMPTY;
						}),
					),
				),
			)
			.subscribe((unreadCounts: MenuUnreadCounts) => {
				const updatedMenus = this.applyMenuUnreadCounts(
					this.menus,
					unreadCounts,
				);

				this.showNewWorkNotifications(
					this.menus,
					updatedMenus,
					unreadCounts,
				);
				this.mainService.setMenus(updatedMenus);
			});

		this.subscriptions.add(subscription);
	}

	private loadMainData(): void {
		const subscription = this.mainService.getUser().subscribe({
			next: (response: UserSessionResponse) => {
				this.user = response.user ?? this.user;

				if (response.user) {
					this.sessionService.setUser(response.user);
				}

				this.sessionService.setAccess(
					response.roleCodes ?? [],
					response.permissionCodes ?? [],
				);

				this.sessionService.setMenus(response.menus ?? []);
				this.mainService.setMenus(response.menus ?? []);

				this.isMenuLoading = false;
			},
			error: (error: unknown) => {
				console.error('Failed to load user and menu data', error);

				this.sessionService.setAccess([], []);
				this.isMenuLoading = false;
			},
		});

		this.subscriptions.add(subscription);
	}

	getUserDisplayName(): string {
		return (
			this.user?.fullName?.trim() || this.user?.email?.trim() || 'User'
		);
	}

	getUserInitial(): string {
		return this.getUserDisplayName().charAt(0).toUpperCase();
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
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

	searchMenu(event: Event): void {
		if (
			(event as KeyboardEvent).key === 'ArrowDown' ||
			(event as KeyboardEvent).key === 'ArrowUp' ||
			(event as KeyboardEvent).key === 'Enter'
		) {
			return;
		}

		const input = event.target as HTMLInputElement;
		const keyword = input.value;

		this.selectedMenuIndex = 0;
		this.filteredMenuComponents = [];

		if (!keyword.trim()) {
			for (const menuComponent of this.menuComponents ?? []) {
				menuComponent.resetFilter();
			}

			return;
		}

		for (const menuComponent of this.menuComponents ?? []) {
			this.filteredMenuComponents.push(
				...menuComponent.filterMenu(keyword),
			);
		}

		this.selectMenu();
	}

	searchMenuFocus(): void {
		this.isMenuFiltering = true;
		this.selectMenu();
	}

	searchMenuBlur(): void {
		window.setTimeout(() => {
			this.isMenuFiltering = false;

			for (const menuComponent of this.filteredMenuComponents) {
				menuComponent.unselect();
			}
		}, 150);
	}

	onMenuClicked(menu: Menu): void {
		if (!menu.route) {
			return;
		}

		if (this.mainService.getSidebarMode() === 'over') {
			void this.mainService.hideSidebar();
		}
	}

	openChangePasswordDialog(): void {
		this.dialog
			.open(ChangePasswordDialogComponent, {
				width: '520px',
				maxWidth: '95vw',
				disableClose: true,
				autoFocus: false,
			})
			.afterClosed()
			.subscribe((result) => {
				if (result?.action !== 'save') {
					return;
				}

				this.sessionService.logoutLocal('password-changed');
			});
	}

	logout(): void {
		this.sessionService.logoutLocal();
	}

	@HostListener('document:keydown.arrowdown', ['$event'])
	onArrowDown(event: Event): void {
		if (!this.isMenuFiltering) {
			return;
		}

		event.preventDefault();

		const length = this.filteredMenuComponents.length;

		if (length === 0) {
			return;
		}

		this.selectedMenuIndex =
			this.selectedMenuIndex >= length - 1
				? 0
				: this.selectedMenuIndex + 1;

		this.selectMenu();
	}

	@HostListener('document:keydown.arrowup', ['$event'])
	onArrowUp(event: Event): void {
		if (!this.isMenuFiltering) {
			return;
		}

		event.preventDefault();

		const length = this.filteredMenuComponents.length;

		if (length === 0) {
			return;
		}

		this.selectedMenuIndex =
			this.selectedMenuIndex <= 0
				? length - 1
				: this.selectedMenuIndex - 1;

		this.selectMenu();
	}

	@HostListener('document:keydown.enter', ['$event'])
	onEnter(event: Event): void {
		if (!this.isMenuFiltering) {
			return;
		}

		event.preventDefault();

		const selectedMenuComponent =
			this.filteredMenuComponents[this.selectedMenuIndex];

		const route = selectedMenuComponent?.menu.route;

		if (!route) {
			return;
		}

		void this.router.navigateByUrl(route);
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

	private showNewWorkNotifications(
		previousMenus: Menu[],
		updatedMenus: Menu[],
		unreadCounts: MenuUnreadCounts,
	): void {
		const approvalIncrease =
			this.getMenuUnreadCountByRoute(
				updatedMenus,
				'/equipment-request/approvals',
			) -
			this.getMenuUnreadCountByRoute(
				previousMenus,
				'/equipment-request/approvals',
			);
		const operationsIncrease =
			this.getMenuUnreadCountByRoute(
				updatedMenus,
				'/equipment-request/operations',
			) -
			this.getMenuUnreadCountByRoute(
				previousMenus,
				'/equipment-request/operations',
			);

		const messages: string[] = [];

		if (approvalIncrease > 0) {
			messages.push(
				approvalIncrease === 1
					? 'New approval request available'
					: `${approvalIncrease} new approval requests`,
			);
		}

		if (operationsIncrease > 0) {
			messages.push(
				operationsIncrease === 1
					? 'New operation work item available'
					: `${operationsIncrease} new operation work items`,
			);
		}

		if (messages.length === 0) {
			return;
		}

		const targetRoute =
			messages.length === 1
				? approvalIncrease > 0
					? '/equipment-request/approvals'
					: '/equipment-request/operations'
				: null;
		const targetReferenceUuid =
			targetRoute === '/equipment-request/operations'
				? this.getLatestReferenceUuidByRoute(
						updatedMenus,
						unreadCounts,
						targetRoute,
					)
				: null;
		const snackBarRef = this.snackBar.open(
			messages.join(' • '),
			targetRoute ? 'View' : undefined,
			{
				duration: 7000,
				horizontalPosition: 'right',
				verticalPosition: 'top',
				panelClass: ['work-notification-snackbar'],
			},
		);

		if (!targetRoute) {
			return;
		}

		const actionSubscription = snackBarRef.onAction().subscribe(() => {
			if (
				targetRoute === '/equipment-request/operations' &&
				targetReferenceUuid
			) {
				void this.router.navigate([targetRoute], {
					queryParams: { referenceUuid: targetReferenceUuid },
				});
				return;
			}

			void this.router.navigateByUrl(targetRoute);
		});

		this.subscriptions.add(actionSubscription);
	}

	private getLatestReferenceUuidByRoute(
		menus: Menu[],
		unreadCounts: MenuUnreadCounts,
		route: string,
	): string | null {
		const menu = this.findMenuByRoute(menus, route);

		if (!menu) {
			return null;
		}

		return unreadCounts[menu.code]?.latestReferenceUuid ?? null;
	}

	private getMenuUnreadCountByRoute(menus: Menu[], route: string): number {
		const menu = this.findMenuByRoute(menus, route);

		return Number(menu?.unreadCount ?? 0);
	}

	private findMenuByRoute(menus: Menu[], route: string): Menu | null {
		for (const menu of menus ?? []) {
			if (this.normalizeMenuRoute(menu.route) === route) {
				return menu;
			}

			const childMatch = this.findMenuByRoute(menu.child ?? [], route);

			if (childMatch) {
				return childMatch;
			}
		}

		return null;
	}

	private normalizeMenus(menus: any[], level = 0): Menu[] {
		return [...menus]
			.sort(
				(first, second) =>
					Number(first.sequence ?? 0) - Number(second.sequence ?? 0),
			)
			.map((menu) => {
				const children = this.normalizeMenus(
					menu.child ?? [],
					level + 1,
				);

				return {
					menuId: Number(menu.menuId ?? menu.id),
					menuName: menu.menuName ?? menu.label ?? '',
					menuTypeId: 4,
					parentId: menu.parentId ?? null,
					code: menu.code ?? '',
					sequence: Number(menu.sequence ?? 0),
					route: this.normalizeMenuRoute(menu.route),
					icon: menu.icon ?? null,
					unreadCount: Number(menu.unreadCount ?? 0),
					unreadReferenceUuids: menu.unreadReferenceUuids ?? [],
					level: menu.level ?? level,
					child: children,
					visibility:
						menu.visibility ??
						(children.length > 0 ? 'collapsed' : 'no-child'),
				};
			});
	}

	private normalizeMenuRoute(
		route: string | null | undefined,
	): string | null {
		if (!route) {
			return null;
		}

		const normalizedRoute = route.trim();

		if (!normalizedRoute) {
			return null;
		}

		if (normalizedRoute === '/main' || normalizedRoute === 'main') {
			return '/home';
		}

		if (normalizedRoute.startsWith('/main/')) {
			return normalizedRoute.replace(/^\/main/, '');
		}

		if (normalizedRoute.startsWith('main/')) {
			return `/${normalizedRoute.replace(/^main\//, '')}`;
		}

		return normalizedRoute.startsWith('/')
			? normalizedRoute
			: `/${normalizedRoute}`;
	}

	private initSidebarEvents(): void {
		const mediaSubscription = this.media
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
					this.mainService.setSidebarMode('side');
					void this.mainService.showSidebar();
					return;
				}

				this.mainService.setSidebarMode('over');
				void this.mainService.hideSidebar();
			});

		const routerSubscription = this.router.events.subscribe((event) => {
			if (
				event instanceof NavigationStart &&
				this.mainService.getSidebarMode() === 'over'
			) {
				void this.mainService.hideSidebar();
			}
		});

		this.subscriptions.add(mediaSubscription);
		this.subscriptions.add(routerSubscription);
	}

	private initToolbarTitle(): void {
		const subscription = this.router.events
			.pipe(
				filter(
					(event): event is NavigationEnd =>
						event instanceof NavigationEnd,
				),
			)
			.subscribe(() => {
				this.currentUrl = this.getCurrentUrl();

				let route = this.activatedRoute;
				let routePath = '';

				let toolbarTitle = '';
				let toolbarSubtitle = '';

				const breadcrumbs: Breadcrumb[] = [];

				while (route.firstChild) {
					route = route.firstChild;

					const routeUrl = route.snapshot.url
						.map((segment) => segment.path)
						.join('/');

					if (routeUrl) {
						routePath += `/${routeUrl}`;
					}

					const data = route.snapshot.data;

					if (data['title'] !== undefined) {
						toolbarTitle = String(data['title']);
					}

					if (data['subtitle'] !== undefined) {
						toolbarSubtitle = String(data['subtitle']);

						if (toolbarSubtitle) {
							breadcrumbs.push({
								label: toolbarSubtitle,
								path: routePath,
							});
						}
					}
				}

				this.mainService.setToolbarTitle(toolbarTitle);
				this.mainService.setToolbarSubtitle(toolbarSubtitle);
				this.mainService.setBreadcrumbs(breadcrumbs);
			});

		this.subscriptions.add(subscription);
	}

	private selectMenu(): void {
		for (
			let index = 0;
			index < this.filteredMenuComponents.length;
			index++
		) {
			const menuComponent = this.filteredMenuComponents[index];

			menuComponent.unselect();

			if (index === this.selectedMenuIndex) {
				menuComponent.select();
			}
		}
	}

	private getCurrentUrl(): string {
		return this.router.url.split('?')[0].split('#')[0];
	}
}
