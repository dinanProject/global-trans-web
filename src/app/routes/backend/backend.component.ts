import { Component, HostListener, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Client, SessionService, User } from 'src/app/services/session.service';
import { BackendService, Breadcrumb } from './backend.service';
import { environment as env } from 'src/environments/environment';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { filter, map, mergeMap, switchMap } from 'rxjs/operators';
import { Menu, MenuComponent } from './menu.component';
import { of, Subscription } from 'rxjs';
import { MediaChange, MediaObserver } from '@angular/flex-layout';
import { MatDialog } from '@angular/material/dialog';
import { ProfileComponent } from './profile.component';
import { WebSocketService } from 'src/app/services/websocket.service';

@Component({
	selector: 'app-backend',
	templateUrl: './backend.component.html',
	styleUrls: ['./backend.component.scss']
})
export class BackendComponent implements OnInit {

	watcher: Subscription;
	user: User;
	currentUrl: string;
	menus: Menu[] = [];
	client: Client;

	search = '';
	selectedMenuIndex = 0;
	isMenuFiltering: boolean;
	filteredMenuComponents: Array<MenuComponent> = [];
	@ViewChildren(MenuComponent) menuComponents: QueryList<MenuComponent>;
	isWebSocketConnected: boolean;

	constructor(
		private activatedRoute: ActivatedRoute,
		private backendService: BackendService,
		private titleService: Title,
		private sessionService: SessionService,
		private media: MediaObserver,
		private router: Router,
		private dialog: MatDialog,
		private webSocketService: WebSocketService
	) {
		this.initSidebarEvents();
		this.initToolbarTitle();
	}

	ngOnInit(): void {
		this.titleService.setTitle('Raya - ' + this.sessionService.getClient().clientName);
		this.isMenuFiltering = false;
		this.initWebSocket()
			.then(() => this.getUser());

		this.client = this.sessionService.getClient();
	}

	initWebSocket() {
		return new Promise<void>((resolve) => {
			this.webSocketService.connect();
			this.isWebSocketConnected = false;
			this.webSocketService.onOpen.subscribe(() => {
				console.log('Websocket connected');
				this.isWebSocketConnected = true;
			});
			this.webSocketService.onError.subscribe(() => {
				console.log('Websocket onError');
				this.isWebSocketConnected = false;
			});
			this.webSocketService.onClose.subscribe(() => {
				console.log('Websocket closed');
				this.isWebSocketConnected = false;
			});
			resolve();
		});
	}

	initSidebarEvents() {
		this.watcher = this.media.asObservable()
			.pipe(
				filter((changes: MediaChange[]) => changes.length > 0),
				map((changes: MediaChange[]) => changes[0])
			).subscribe((change: MediaChange) => {
				if (change.mqAlias !== 'lg' && change.mqAlias !== 'xl') {
					this.backendService.isMobile = true;
					this.backendService.hideSidebar();
					this.backendService.setSidebarMode('over');
				} else {
					this.backendService.isMobile = false;
					this.backendService.showSidebar();
					this.backendService.setSidebarMode('side');
				}
			});

		this.router.events.subscribe((event) => {
			if (event instanceof NavigationStart) {
				if (this.backendService.getSidebarMode() === 'over') {
					this.backendService.hideSidebar();
				}
			}
		});
	}

	initToolbarTitle() {
		this.router.events
			.pipe(
				filter((event) => event instanceof NavigationEnd),
				map(() => this.activatedRoute),
				map((route) => {
					let url = '';
					const urls = [];
					while (route.firstChild) {
						// console.log('route', route.firstChild);
						route = route.firstChild;
						if (route.snapshot.url.length > 0) {
							url += '/';
							url += route.snapshot.url[0].path;
							// console.log('route.snapshot', route.snapshot);
						}
						const data = route.snapshot.data;
						if (data.subtitle) {
							urls.push({
								label: data.subtitle,
								path: url
							});
						}
					}
					return {
						route: route,
						urls: urls
					};
				}),
				filter((result) => result.route.outlet === 'primary'),
				// mergeMap((result) => {
				// 	return of(result);
				// })
			)
			.subscribe((result) => {
				this.currentUrl = this.router.url.split('?')[0];
				// console.log('result', result);
				const data = result.route.snapshot.data;
				// console.log('data', data);
				this.backendService.setToolbarTitle(data.title);
				this.backendService.setToolbarSubtitle(data.subtitle);
				this.backendService.setBreadcrumbs(result.urls);
			});
	}

	toggleSidebar() {
		this.backendService.toggleSidebar();
	}

	getSidebarMode() {
		return this.backendService.getSidebarMode();
	}

	isSidebarOpened() {
		return this.backendService.isSidebarOpened();
	}

	getToolbarTitle(): string {
		return this.backendService.getToolbarTitle();
	}

	getToolbarSubtitle(): string {
		return this.backendService.getToolbarSubtitle();
	}

	getBreadcrumbs(): Breadcrumb[] {
		return this.backendService.getBreadcrumbs();
	}

	getToolbarBreadcrumbs() {

	}

	getUser() {
		this.backendService.getUser().subscribe((data: { user: User, menus: Menu[] }) => {
			// console.log(data)
			this.user = data.user;
			this.menus = data.menus;
		})
	}

	ngOnDestroy() {
		this.watcher.unsubscribe();
	}

	searchMenu(e) {
		if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
			return;
		}

		this.selectedMenuIndex = 0;
		this.filteredMenuComponents = [];
		for (const mc of this.menuComponents) {
			this.filteredMenuComponents.push(...mc.filterMenu(e.target.value));
		}

		this.selectMenu();
	}

	searchMenuFocus() {
		this.isMenuFiltering = true;
		this.selectMenu();
	}

	searchMenuBlur() {
		this.isMenuFiltering = false;
		this.filteredMenuComponents.forEach((menuComponent: MenuComponent) => {
			menuComponent.unselect();
		})
	}

	selectMenu() {
		this.filteredMenuComponents.forEach((menuComponent: MenuComponent, index: number) => {
			menuComponent.unselect();
			if (index === this.selectedMenuIndex) {
				menuComponent.select();
			}
		})
	}

	userProfile() {
		this.dialog
			.open(ProfileComponent, {
				width: '300px',
				height: '389px'
				// height: '450px'
			})
			.afterClosed()
			.subscribe(result => {
				if (result) {
					this.sessionService.clear();
					const returnUrl = this.router.url;
					this.router.navigate(['/auth/login'], {
						queryParams: { returnUrl }
					});
				}
			})
	}

	@HostListener('document:keydown.arrowdown', ['$event']) onArrowRightDownKeyDown(event: KeyboardEvent) {
		if (!this.isMenuFiltering) {
			return;
		}
		event.preventDefault();
		const length = this.filteredMenuComponents.length
		if (this.selectedMenuIndex === (length - 1)) {
			this.selectedMenuIndex = 0;
		} else {
			this.selectedMenuIndex++;
		}

		this.selectMenu();
	}

	@HostListener('document:keydown.arrowup', ['$event']) onArrowLeftUpKeyDown(event: KeyboardEvent) {
		if (!this.isMenuFiltering) {
			return;
		}
		event.preventDefault();
		const length = this.filteredMenuComponents.length
		if (this.selectedMenuIndex === 0) {
			this.selectedMenuIndex = length - 1;
		} else {
			this.selectedMenuIndex--;
		}

		this.selectMenu();
	}

	@HostListener('document:keydown.enter', ['$event']) onEnter(event: KeyboardEvent) {
		if (!this.isMenuFiltering) {
			return;
		}
		event.preventDefault();
		this.filteredMenuComponents.forEach((menuComponent: MenuComponent, index: number) => {
			menuComponent.unselect();
			if (index === this.selectedMenuIndex) {
				return this.router.navigateByUrl(menuComponent.menu.route);
			}
		})
	}
}
