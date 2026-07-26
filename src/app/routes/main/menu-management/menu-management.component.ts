import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import {
	Subject,
	catchError,
	debounceTime,
	distinctUntilChanged,
	finalize,
	of,
	takeUntil,
} from 'rxjs';

import { MenuDialogComponent } from './menu-dialog/menu-dialog.component';
import {
	Menu,
	MenuDialogResult,
	MenuManagementService,
} from './menu-management.service';
import { UtilityService } from 'src/app/shared/utility/utility.service';
import { MainService } from '../main.service';

interface MenuRow extends Menu {
	level: number;
	hasChildren: boolean;
}

@Component({
	selector: 'app-menu-management',
	templateUrl: './menu-management.component.html',
	styleUrls: ['./menu-management.component.scss'],
	standalone: false,
})
export class MenuManagementComponent implements OnInit, OnDestroy {
	private readonly destroy$ = new Subject<void>();

	search = new FormControl('', {
		nonNullable: true,
	});

	menus: Menu[] = [];
	menuRows: MenuRow[] = [];

	expandedMenuIds = new Set<number>();

	isLoading = false;
	errorMessage = '';

	displayedColumns = [
		'menuName',
		'code',
		'route',
		'permission',
		'sequence',
		'status',
		'actions',
	];

	constructor(
		private menuService: MenuManagementService,
		private mainService: MainService,
		private dialog: MatDialog,
		private utilityService: UtilityService,
	) {}

	ngOnInit(): void {
		this.search.valueChanges
			.pipe(
				debounceTime(250),
				distinctUntilChanged(),
				takeUntil(this.destroy$),
			)
			.subscribe(() => this.refreshRows());

		this.loadMenus();
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	loadMenus(): void {
		this.isLoading = true;
		this.errorMessage = '';

		this.menuService
			.getMenus()
			.pipe(
				takeUntil(this.destroy$),
				catchError((error) => {
					this.errorMessage =
						error?.error?.meta?.message ?? 'Failed to load menus.';

					return of([]);
				}),
				finalize(() => {
					this.isLoading = false;
				}),
			)
			.subscribe((menus: Menu[]) => {
				console.log('menu management menus:', menus);
				this.menus = menus ?? [];
				this.refreshRows();
			});
	}

	openCreateDialog(parentMenu?: Menu): void {
		const dialogRef = this.dialog.open(MenuDialogComponent, {
			width: '760px',
			disableClose: true,
			data: {
				mode: 'create',
				parentMenu,
				menus: this.menus,
			},
		});

		dialogRef
			.afterClosed()
			.pipe(takeUntil(this.destroy$))
			.subscribe((result?: MenuDialogResult) => {
				if (!result) {
					return;
				}

				this.createMenu(result);
			});
	}

	openEditDialog(menu: Menu): void {
		const dialogRef = this.dialog.open(MenuDialogComponent, {
			width: '760px',
			disableClose: true,
			data: {
				mode: 'edit',
				menu,
				menus: this.menus,
			},
		});

		dialogRef
			.afterClosed()
			.pipe(takeUntil(this.destroy$))
			.subscribe((result?: MenuDialogResult) => {
				if (!result) {
					return;
				}

				this.updateMenu(menu, result);
			});
	}

	async deactivateMenu(menu: Menu): Promise<void> {
		const confirmed = await this.utilityService.confirm(
			'Deactivate Menu',
			`Deactivate menu "${menu.menuName}"?`,
			'warning',
		);

		if (!confirmed) {
			return;
		}

		this.isLoading = true;
		this.errorMessage = '';

		this.menuService
			.deactivateMenu(menu.uuid)
			.pipe(
				takeUntil(this.destroy$),
				finalize(() => {
					this.isLoading = false;
				}),
			)
			.subscribe({
				next: () => {
					this.utilityService.alert(
						'Success',
						`Menu "${menu.menuName}" berhasil dinonaktifkan.`,
						'success',
					);

					this.loadMenus();
					this.mainService.refreshMenus();
				},
				error: (error) => {
					this.utilityService.alert(
						'Error',
						error?.error?.meta?.message ??
							'Menu gagal dinonaktifkan.',
						'error',
					);
				},
			});
	}

	toggleMenu(menu: MenuRow): void {
		if (!menu.hasChildren) {
			return;
		}

		if (this.expandedMenuIds.has(menu.menuId)) {
			this.expandedMenuIds.delete(menu.menuId);
		} else {
			this.expandedMenuIds.add(menu.menuId);
		}

		this.refreshRows();
	}

	isExpanded(menuId: number): boolean {
		return this.expandedMenuIds.has(menuId);
	}

	trackByMenuId(index: number, menu: MenuRow): number {
		return menu.menuId;
	}

	private createMenu(result: MenuDialogResult): void {
		this.isLoading = true;
		this.errorMessage = '';

		this.menuService
			.createMenu(result.payload)
			.pipe(
				takeUntil(this.destroy$),
				catchError((error) => {
					this.errorMessage =
						error?.error?.meta?.message ?? 'Failed to create menu.';

					return of(null);
				}),
				finalize(() => {
					this.isLoading = false;
				}),
			)
			.subscribe((response: any) => {
				if (!response) {
					return;
				}

				const menu: Menu | null = response.data ?? null;

				if (menu?.parentId) {
					this.expandedMenuIds.add(menu.parentId);
				}

				this.loadMenus();
			});
	}

	private updateMenu(menu: Menu, result: MenuDialogResult): void {
		this.isLoading = true;
		this.errorMessage = '';

		this.menuService
			.updateMenu(menu.uuid, result.payload)
			.pipe(
				takeUntil(this.destroy$),
				catchError((error) => {
					this.errorMessage =
						error?.error?.meta?.message ?? 'Failed to update menu.';

					return of(null);
				}),
				finalize(() => {
					this.isLoading = false;
				}),
			)
			.subscribe((response: any) => {
				if (!response) {
					return;
				}

				this.loadMenus();
			});
	}

	private refreshRows(): void {
		const searchValue = this.search.value.trim().toLowerCase();

		if (searchValue) {
			this.menuRows = this.buildSearchRows(searchValue);
			return;
		}

		this.menuRows = this.buildVisibleRows();
	}

	private buildVisibleRows(): MenuRow[] {
		const rows: MenuRow[] = [];

		const appendChildren = (
			parentId: number | null,
			level: number,
		): void => {
			const children = this.getChildren(parentId);

			for (const menu of children) {
				const hasChildren = this.getChildren(menu.menuId).length > 0;

				rows.push({
					...menu,
					level,
					hasChildren,
				});

				if (hasChildren && this.expandedMenuIds.has(menu.menuId)) {
					appendChildren(menu.menuId, level + 1);
				}
			}
		};

		appendChildren(null, 0);

		return rows;
	}

	private buildSearchRows(searchValue: string): MenuRow[] {
		const matchedIds = new Set<number>();

		for (const menu of this.menus) {
			const searchableValue = [
				menu.menuName,
				menu.code,
				menu.route,
				menu.permissionCode,
				menu.permissionLabel,
			]
				.filter(Boolean)
				.join(' ')
				.toLowerCase();

			if (searchableValue.includes(searchValue)) {
				matchedIds.add(menu.menuId);
				this.addAncestorIds(menu, matchedIds);
			}
		}

		const rows: MenuRow[] = [];

		const appendChildren = (
			parentId: number | null,
			level: number,
		): void => {
			for (const menu of this.getChildren(parentId)) {
				if (!matchedIds.has(menu.menuId)) {
					continue;
				}

				const hasChildren = this.getChildren(menu.menuId).length > 0;

				rows.push({
					...menu,
					level,
					hasChildren,
				});

				appendChildren(menu.menuId, level + 1);
			}
		};

		appendChildren(null, 0);

		return rows;
	}

	private addAncestorIds(menu: Menu, menuIds: Set<number>): void {
		let parentId = menu.parentId;

		while (parentId !== null) {
			const parent = this.menus.find((item) => item.menuId === parentId);

			if (!parent) {
				break;
			}

			menuIds.add(parent.menuId);
			parentId = parent.parentId;
		}
	}

	private getChildren(parentId: number | null): Menu[] {
		return this.menus
			.filter((menu) => menu.parentId === parentId)
			.sort((a, b) => {
				if (a.sequence !== b.sequence) {
					return a.sequence - b.sequence;
				}

				return a.menuId - b.menuId;
			});
	}
}
