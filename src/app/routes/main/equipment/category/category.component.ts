import {
	AfterViewInit,
	Component,
	OnDestroy,
	OnInit,
	ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { catchError, finalize, of, Subject, takeUntil } from 'rxjs';

import { UtilityService } from '../../../../shared/utility/utility.service';

import {
	Category,
	CategoryDialogResult,
	CategoryService,
} from './category.service';
import { CategoryDialogComponent } from './category-dialog/category-dialog.component';

type CategoryStatusFilter = 'all' | 'active' | 'inactive';

@Component({
	selector: 'app-category',
	templateUrl: './category.component.html',
	styleUrls: ['./category.component.scss'],
	standalone: false,
})
export class CategoryComponent implements OnInit, AfterViewInit, OnDestroy {
	@ViewChild(MatSort)
	sort!: MatSort;

	private readonly destroy$ = new Subject<void>();

	readonly searchControl = new FormControl<string>('', {
		nonNullable: true,
	});

	readonly statusControl = new FormControl<CategoryStatusFilter>('all', {
		nonNullable: true,
	});

	readonly displayedColumns: string[] = [
		'name',
		'code',
		'description',
		'status',
		'actions',
	];

	categories: Category[] = [];

	dataSource = new MatTableDataSource<Category>([]);

	isLoading = false;
	errorMessage = '';

	constructor(
		private categoryService: CategoryService,
		private dialog: MatDialog,
		private utilityService: UtilityService,
	) {}

	ngOnInit(): void {
		this.initializeFilter();
		this.loadCategories();
	}

	ngAfterViewInit(): void {
		this.dataSource.sort = this.sort;

		this.dataSource.sortingDataAccessor = (
			category: Category,
			column: string,
		): string | number => {
			switch (column) {
				case 'status':
					return this.isActive(category) ? 1 : 0;

				default:
					return (
						(category[column as keyof Category] as
							| string
							| number
							| null) ?? ''
					);
			}
		};
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	loadCategories(): void {
		this.isLoading = true;
		this.errorMessage = '';

		this.categoryService
			.getCategories()
			.pipe(
				takeUntil(this.destroy$),
				catchError((error) => {
					this.errorMessage =
						error?.error?.meta?.message ??
						'Failed to load equipment categories.';

					return of([]);
				}),
				finalize(() => {
					this.isLoading = false;
				}),
			)
			.subscribe((categories: Category[]) => {
				this.categories = categories ?? [];
				this.applyFilters();
			});
	}

	trackByCategoryId(index: number, category: Category): number | string {
		return category.id ?? category.uuid ?? index;
	}

	getCategoryIcon(icon?: string | null): string {
		const normalizedIcon = icon?.trim();

		if (!normalizedIcon || normalizedIcon.startsWith('fas ')) {
			return 'assets/icons/equipment/equipment.svg';
		}

		return `assets/icons/equipment/${normalizedIcon}`;
	}

	openCreateDialog(): void {
		const dialogRef = this.dialog.open(CategoryDialogComponent, {
			width: '700px',
			maxWidth: '95vw',
			disableClose: true,
			data: {
				mode: 'create',
			},
		});

		dialogRef
			.afterClosed()
			.pipe(takeUntil(this.destroy$))
			.subscribe((result: CategoryDialogResult | undefined) => {
				if (!result || result.action !== 'save') {
					return;
				}

				this.createCategory(result.payload);
			});
	}

	openEditDialog(category: Category): void {
		const dialogRef = this.dialog.open(CategoryDialogComponent, {
			width: '700px',
			maxWidth: '95vw',
			disableClose: true,
			data: {
				mode: 'edit',
				category,
			},
		});

		dialogRef
			.afterClosed()
			.pipe(takeUntil(this.destroy$))
			.subscribe((result: CategoryDialogResult | undefined) => {
				if (!result || result.action !== 'save') {
					return;
				}

				this.updateCategory(category.uuid, result.payload);
			});
	}

	async deactivateCategory(category: Category): Promise<void> {
		const confirmed = await this.utilityService.confirm(
			'Deactivate Equipment Category',
			`Are you sure you want to deactivate "${category.name}"?`,
			'warning',
		);

		if (!confirmed) {
			return;
		}

		this.isLoading = true;

		this.categoryService
			.deactivateCategory(category.uuid)
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
						'Equipment category successfully deactivated.',
						'success',
					);

					this.loadCategories();
				},
				error: (error) => {
					this.utilityService.alert(
						'Failed',
						error?.error?.meta?.message ??
							'Failed to deactivate equipment category.',
						'error',
					);
				},
			});
	}

	resetFilters(): void {
		this.searchControl.setValue('', {
			emitEvent: false,
		});

		this.statusControl.setValue('all', {
			emitEvent: false,
		});

		this.applyFilters();
	}

	isActive(category: Category): boolean {
		return category.isActive === true || category.isActive === 1;
	}

	get hasFilters(): boolean {
		return (
			this.searchControl.value.trim() !== '' ||
			this.statusControl.value !== 'all'
		);
	}

	private initializeFilter(): void {
		this.searchControl.valueChanges
			.pipe(takeUntil(this.destroy$))
			.subscribe(() => this.applyFilters());

		this.statusControl.valueChanges
			.pipe(takeUntil(this.destroy$))
			.subscribe(() => this.applyFilters());
	}

	private applyFilters(): void {
		const search = this.searchControl.value.trim().toLowerCase();
		const status = this.statusControl.value;

		const filteredCategories = this.categories.filter((category) => {
			const searchableText = [
				category.code,
				category.name,
				category.description,
			]
				.filter(Boolean)
				.join(' ')
				.toLowerCase();

			const matchesSearch = !search || searchableText.includes(search);

			const categoryIsActive = this.isActive(category);

			const matchesStatus =
				status === 'all' ||
				(status === 'active' && categoryIsActive) ||
				(status === 'inactive' && !categoryIsActive);

			return matchesSearch && matchesStatus;
		});

		this.dataSource.data = filteredCategories;
	}

	private createCategory(payload: CategoryDialogResult['payload']): void {
		this.isLoading = true;

		this.categoryService
			.createCategory(payload)
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
						'Equipment category successfully created.',
						'success',
					);

					this.loadCategories();
				},
				error: (error) => {
					this.utilityService.alert(
						'Failed',
						error?.error?.meta?.message ??
							'Failed to create equipment category.',
						'error',
					);
				},
			});
	}

	private updateCategory(
		uuid: string,
		payload: CategoryDialogResult['payload'],
	): void {
		this.isLoading = true;

		this.categoryService
			.updateCategory(uuid, payload)
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
						'Equipment category successfully updated.',
						'success',
					);

					this.loadCategories();
				},
				error: (error) => {
					this.utilityService.alert(
						'Failed',
						error?.error?.meta?.message ??
							'Failed to update equipment category.',
						'error',
					);
				},
			});
	}
}
