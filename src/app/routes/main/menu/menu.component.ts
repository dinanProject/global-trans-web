import {
	Component,
	EventEmitter,
	Input,
	OnInit,
	Output,
	QueryList,
	ViewChildren,
} from '@angular/core';

import { Menu } from 'src/app/core/models/menu.model';

@Component({
	selector: 'app-menu',
	templateUrl: './menu.component.html',
	styleUrls: ['./menu.component.scss'],
	standalone: false,
})
export class MenuComponent implements OnInit {
	@Input({ required: true })
	menu!: Menu;

	@Input()
	menuLevel = 0;

	@Input()
	currentUrl = '';

	@Input()
	selectedMenuIndex = 0;

	@Input()
	isMenuFiltering = false;

	@Output()
	clicked = new EventEmitter<Menu>();

	@ViewChildren(MenuComponent)
	menuComponents!: QueryList<MenuComponent>;

	isHidden = false;
	isMenuSelected = false;

	ngOnInit(): void {
		this.menu.child ??= [];
		this.menu.level = this.menuLevel;

		if (!this.menu.visibility) {
			this.menu.visibility = this.hasChildren ? 'collapsed' : 'no-child';
		}
	}

	get children(): Menu[] {
		return this.menu.child ?? [];
	}

	get hasChildren(): boolean {
		return this.children.length > 0;
	}

	get isLeaf(): boolean {
		return !this.hasChildren;
	}

	get isActive(): boolean {
		if (!this.menu.route) {
			return this.hasActiveChild(this.menu);
		}

		const menuRoute = this.normalizeRoute(this.menu.route);
		const activeRoute = this.normalizeRoute(this.currentUrl);

		return activeRoute === menuRoute;
	}

	filterMenu(value: string): MenuComponent[] {
		const keyword = value.trim().toLowerCase();
		const result: MenuComponent[] = [];

		this.isHidden = false;

		if (!keyword) {
			this.resetFilter();
			return result;
		}

		const menuName = this.menu.menuName.toLowerCase().trim();

		const code = this.menu.code?.toLowerCase().trim() ?? '';

		const route = this.menu.route?.toLowerCase().trim() ?? '';

		const currentMenuMatches =
			menuName.includes(keyword) ||
			code.includes(keyword) ||
			route.includes(keyword);

		if (!this.hasChildren) {
			if (currentMenuMatches) {
				result.push(this);
			} else {
				this.isHidden = true;
			}

			return result;
		}

		const childResults: MenuComponent[] = [];

		for (const menuComponent of this.menuComponents ?? []) {
			childResults.push(...menuComponent.filterMenu(keyword));
		}

		if (currentMenuMatches || childResults.length > 0) {
			this.menu.visibility = 'expanded';
			result.push(this, ...childResults);
		} else {
			this.isHidden = true;
		}

		return result;
	}

	resetFilter(): void {
		this.isHidden = false;
		this.isMenuSelected = false;

		if (this.hasChildren) {
			this.menu.visibility = 'collapsed';
		}

		for (const menuComponent of this.menuComponents ?? []) {
			menuComponent.resetFilter();
		}
	}

	select(): void {
		this.isMenuSelected = true;
	}

	unselect(): void {
		this.isMenuSelected = false;
	}

	onMenuClick(event: MouseEvent): void {
		/*
		 * Parent tanpa route:
		 * hanya expand/collapse dan jangan jalankan routerLink.
		 */
		if (this.hasChildren && !this.menu.route) {
			event.preventDefault();

			this.menu.visibility =
				this.menu.visibility === 'expanded' ? 'collapsed' : 'expanded';

			return;
		}

		/*
		 * Parent yang juga punya route:
		 * saat ini tetap toggle. Kalau nanti ingin sekaligus navigasi,
		 * blok ini bisa diubah.
		 */
		if (this.hasChildren) {
			event.preventDefault();

			this.menu.visibility =
				this.menu.visibility === 'expanded' ? 'collapsed' : 'expanded';

			return;
		}

		/*
		 * Menu tanpa child tetapi juga tanpa route tidak boleh navigasi.
		 */
		if (!this.menu.route) {
			event.preventDefault();
			return;
		}

		/*
		 * Leaf dengan route:
		 * jangan preventDefault supaya routerLink berjalan.
		 */
		this.clicked.emit(this.menu);
	}

	private hasActiveChild(menu: Menu): boolean {
		const children = menu.child ?? [];

		return children.some((child) => {
			if (child.route) {
				const childRoute = this.normalizeRoute(child.route);
				const activeRoute = this.normalizeRoute(this.currentUrl);

				if (childRoute === activeRoute) {
					return true;
				}
			}

			return this.hasActiveChild(child);
		});
	}

	private normalizeRoute(route: string): string {
		const normalized = route.split('?')[0].split('#')[0];

		if (normalized.length > 1 && normalized.endsWith('/')) {
			return normalized.slice(0, -1);
		}

		return normalized;
	}
}
