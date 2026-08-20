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
import { catchError, finalize, forkJoin, of, Subject, takeUntil } from 'rxjs';

import { UtilityService } from '../../../../shared/utility/utility.service';

import {
	CapacityUnitOption,
	OperationalStatusOption,
	Unit,
	UnitCategory,
	UnitDialogResult,
	UnitService,
} from './unit.service';

import { UnitDialogComponent } from './unit-dialog/unit-dialog.component';

type UnitStatusFilter = 'all' | 'active' | 'inactive';

@Component({
	selector: 'app-unit',
	templateUrl: './unit.component.html',
	styleUrls: ['./unit.component.scss'],
	standalone: false,
})
export class UnitComponent implements OnInit, AfterViewInit, OnDestroy {
	@ViewChild(MatSort)
	sort!: MatSort;

	private readonly destroy$ = new Subject<void>();

	readonly searchControl = new FormControl<string>('', {
		nonNullable: true,
	});

	readonly categoryControl = new FormControl<string>('all', {
		nonNullable: true,
	});

	readonly statusControl = new FormControl<UnitStatusFilter>('all', {
		nonNullable: true,
	});

	readonly displayedColumns: string[] = [
		'unit',
		'category',
		'assetNumber',
		'modelNumber',
		'plateNumber',
		'status',
		'actions',
	];

	units: Unit[] = [];
	categories: UnitCategory[] = [];
	capacityUnits: CapacityUnitOption[] = [];
	operationalStatuses: OperationalStatusOption[] = [];

	dataSource = new MatTableDataSource<Unit>([]);

	isLoading = false;
	errorMessage = '';

	private initialEditValue: {
		categoryUuid: string;
		unitCode: string;
		unitName: string;
		assetNumber: string | null;
		modelNumber: string | null;
		plateNumber: string | null;
		capacityValue: number;
		capacityUnit: string;
		operationalStatusCode: string;
		remarks: string | null;
		isActive: boolean;
	} | null = null;

	constructor(
		private unitService: UnitService,
		private dialog: MatDialog,
		private utilityService: UtilityService,
	) {}

	ngOnInit(): void {
		this.initializeFilter();
		this.loadInitialData();
	}

	ngAfterViewInit(): void {
		this.dataSource.sort = this.sort;

		this.dataSource.sortingDataAccessor = (
			unit: Unit,
			column: string,
		): string | number => {
			switch (column) {
				case 'unit':
					return unit.unitName?.toLowerCase() ?? '';

				case 'category':
					return unit.categoryName?.toLowerCase() ?? '';

				case 'status':
					return this.isActive(unit) ? 1 : 0;

				default:
					return (
						(unit[column as keyof Unit] as
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

	loadInitialData(): void {
		this.isLoading = true;
		this.errorMessage = '';

		forkJoin({
			units: this.unitService.getUnits().pipe(
				catchError((error) => {
					this.errorMessage =
						error?.error?.meta?.message ??
						'Failed to load equipment units.';

					return of([]);
				}),
			),
			categories: this.unitService.getCategories().pipe(
				catchError((error) => {
					if (!this.errorMessage) {
						this.errorMessage =
							error?.error?.meta?.message ??
							'Failed to load equipment categories.';
					}

					return of([]);
				}),
			),
		})
			.pipe(
				takeUntil(this.destroy$),
				finalize(() => {
					this.isLoading = false;
				}),
			)
			.subscribe(({ units, categories }) => {
				this.units = units ?? [];
				this.categories = categories ?? [];

				this.applyFilters();
			});
	}

	loadUnits(): void {
		this.isLoading = true;
		this.errorMessage = '';

		this.unitService
			.getUnits()
			.pipe(
				takeUntil(this.destroy$),
				catchError((error) => {
					this.errorMessage =
						error?.error?.meta?.message ??
						'Failed to load equipment units.';

					return of([]);
				}),
				finalize(() => {
					this.isLoading = false;
				}),
			)
			.subscribe((units: Unit[]) => {
				this.units = units ?? [];
				this.applyFilters();
			});
	}

	trackByUnitId(index: number, unit: Unit): number | string {
		return unit.id ?? unit.uuid ?? index;
	}

	getCategoryIcon(icon?: string | null): string {
		const normalizedIcon = icon?.trim();

		if (!normalizedIcon || normalizedIcon.startsWith('fas ')) {
			return 'assets/icons/equipment/equipment.svg';
		}

		return `assets/icons/equipment/${normalizedIcon}`;
	}

	private loadCapacityUnitsForDialog(callback: () => void): void {
		if (
			this.capacityUnits.length > 0 &&
			this.operationalStatuses.length > 0
		) {
			callback();
			return;
		}

		forkJoin({
			capacityUnits:
				this.capacityUnits.length > 0
					? of(this.capacityUnits)
					: this.unitService.getCapacityUnits(),
			operationalStatuses:
				this.operationalStatuses.length > 0
					? of(this.operationalStatuses)
					: this.unitService.getOperationalStatuses(),
		})
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: ({ capacityUnits, operationalStatuses }) => {
					this.capacityUnits = capacityUnits ?? [];
					this.operationalStatuses = operationalStatuses ?? [];
					callback();
				},
				error: (error) => {
					this.utilityService.alert(
						'Failed',
						error?.error?.meta?.message ??
							'Failed to load equipment unit lookup.',
						'error',
					);
				},
			});
	}

	openCreateDialog(): void {
		this.loadCapacityUnitsForDialog(() => {
			this.openCreateUnitDialog();
		});
	}

	private openCreateUnitDialog(): void {
		const dialogRef = this.dialog.open(UnitDialogComponent, {
			width: '800px',
			maxWidth: '95vw',
			disableClose: true,
			data: {
				mode: 'create',
				categories: this.activeCategories,
				capacityUnits: this.capacityUnits,
				operationalStatuses: this.operationalStatuses,
			},
		});

		dialogRef
			.afterClosed()
			.pipe(takeUntil(this.destroy$))
			.subscribe((result: UnitDialogResult | undefined) => {
				if (!result || result.action !== 'save') {
					return;
				}

				this.createUnit(result.payload);
			});
	}

	openEditDialog(unit: Unit): void {
		this.loadCapacityUnitsForDialog(() => {
			this.openEditUnitDialog(unit);
		});
	}

	private openEditUnitDialog(unit: Unit): void {
		const categories = this.getDialogCategories(unit);

		this.initialEditValue = {
			categoryUuid: unit.categoryUuid,
			unitCode: (unit.unitCode ?? '').trim().toUpperCase(),
			unitName: (unit.unitName ?? '').trim(),
			assetNumber: unit.assetNumber?.trim().toUpperCase() || null,
			modelNumber: unit.modelNumber?.trim() || null,
			plateNumber: unit.plateNumber?.trim().toUpperCase() || null,
			capacityValue: Number(unit.capacityValue),
			capacityUnit: (unit.capacityUnit ?? '').trim().toUpperCase(),
			operationalStatusCode: (unit.operationalStatusCode ?? 'AVAILABLE')
				.trim()
				.toUpperCase(),
			remarks: unit.remarks?.trim() || null,
			isActive: this.isActive(unit),
		};

		const dialogRef = this.dialog.open(UnitDialogComponent, {
			width: '800px',
			maxWidth: '95vw',
			disableClose: true,
			data: {
				mode: 'edit',
				unit,
				categories,
				capacityUnits: this.capacityUnits,
				operationalStatuses: this.operationalStatuses,
			},
		});

		dialogRef
			.afterClosed()
			.pipe(takeUntil(this.destroy$))
			.subscribe((result: UnitDialogResult | undefined) => {
				if (!result || result.action !== 'save') {
					return;
				}

				this.updateUnit(unit.uuid, result.payload);
			});
	}

	async deactivateUnit(unit: Unit): Promise<void> {
		const confirmed = await this.utilityService.confirm(
			'Deactivate Equipment Unit',
			`Are you sure you want to deactivate "${unit.unitName}"?`,
			'warning',
		);

		if (!confirmed) {
			return;
		}

		this.isLoading = true;

		this.unitService
			.deactivateUnit(unit.uuid)
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
						'Equipment unit successfully deactivated.',
						'success',
					);

					this.loadUnits();
				},
				error: (error) => {
					this.utilityService.alert(
						'Failed',
						error?.error?.meta?.message ??
							'Failed to deactivate equipment unit.',
						'error',
					);
				},
			});
	}

	resetFilters(): void {
		this.searchControl.setValue('', {
			emitEvent: false,
		});

		this.categoryControl.setValue('all', {
			emitEvent: false,
		});

		this.statusControl.setValue('all', {
			emitEvent: false,
		});

		this.applyFilters();
	}

	isActive(unit: Unit): boolean {
		return unit.isActive === true || unit.isActive === 1;
	}

	isCategoryActive(category: UnitCategory): boolean {
		return category.isActive === true || category.isActive === 1;
	}

	get activeCategories(): UnitCategory[] {
		return this.categories.filter((category) =>
			this.isCategoryActive(category),
		);
	}

	get hasFilters(): boolean {
		return (
			this.searchControl.value.trim() !== '' ||
			this.categoryControl.value !== 'all' ||
			this.statusControl.value !== 'all'
		);
	}

	private initializeFilter(): void {
		this.searchControl.valueChanges
			.pipe(takeUntil(this.destroy$))
			.subscribe(() => this.applyFilters());

		this.categoryControl.valueChanges
			.pipe(takeUntil(this.destroy$))
			.subscribe(() => this.applyFilters());

		this.statusControl.valueChanges
			.pipe(takeUntil(this.destroy$))
			.subscribe(() => this.applyFilters());
	}

	private applyFilters(): void {
		const search = this.searchControl.value.trim().toLowerCase();
		const categoryUuid = this.categoryControl.value;
		const status = this.statusControl.value;

		const filteredUnits = this.units.filter((unit) => {
			const searchableText = [
				unit.unitCode,
				unit.unitName,
				unit.assetNumber,
				unit.modelNumber,
				unit.plateNumber,
				unit.remarks,
				unit.categoryCode,
				unit.categoryName,
			]
				.filter(Boolean)
				.join(' ')
				.toLowerCase();

			const matchesSearch = !search || searchableText.includes(search);

			const matchesCategory =
				categoryUuid === 'all' || unit.categoryUuid === categoryUuid;

			const unitIsActive = this.isActive(unit);

			const matchesStatus =
				status === 'all' ||
				(status === 'active' && unitIsActive) ||
				(status === 'inactive' && !unitIsActive);

			return matchesSearch && matchesCategory && matchesStatus;
		});

		this.dataSource.data = filteredUnits;
	}

	private getDialogCategories(unit: Unit): UnitCategory[] {
		const categories = [...this.activeCategories];

		const currentCategoryExists = categories.some(
			(category) => category.uuid === unit.categoryUuid,
		);

		if (!currentCategoryExists) {
			const currentCategory = this.categories.find(
				(category) => category.uuid === unit.categoryUuid,
			);

			if (currentCategory) {
				categories.push(currentCategory);
			}
		}

		return categories.sort((firstCategory, secondCategory) =>
			firstCategory.name.localeCompare(secondCategory.name),
		);
	}

	private createUnit(payload: UnitDialogResult['payload']): void {
		this.isLoading = true;

		this.unitService
			.createUnit(payload)
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
						'Equipment unit successfully created.',
						'success',
					);

					this.loadUnits();
				},
				error: (error) => {
					this.utilityService.alert(
						'Failed',
						error?.error?.meta?.message ??
							'Failed to create equipment unit.',
						'error',
					);
				},
			});
	}

	private updateUnit(
		uuid: string,
		payload: UnitDialogResult['payload'],
	): void {
		const currentValue = {
			categoryUuid: payload.categoryUuid,
			unitCode: (payload.unitCode ?? '').trim().toUpperCase(),
			unitName: (payload.unitName ?? '').trim(),
			assetNumber: payload.assetNumber?.trim().toUpperCase() || null,
			modelNumber: payload.modelNumber?.trim() || null,
			plateNumber: payload.plateNumber?.trim().toUpperCase() || null,
			capacityValue: Number(payload.capacityValue),
			capacityUnit: (payload.capacityUnit ?? '').trim().toUpperCase(),
			operationalStatusCode: (
				payload.operationalStatusCode ?? 'AVAILABLE'
			)
				.trim()
				.toUpperCase(),
			remarks: payload.remarks?.trim() || null,
			isActive: Boolean(payload.isActive),
		};

		const hasChanges =
			!this.initialEditValue ||
			currentValue.categoryUuid !== this.initialEditValue.categoryUuid ||
			currentValue.unitCode !== this.initialEditValue.unitCode ||
			currentValue.unitName !== this.initialEditValue.unitName ||
			currentValue.assetNumber !== this.initialEditValue.assetNumber ||
			currentValue.modelNumber !== this.initialEditValue.modelNumber ||
			currentValue.plateNumber !== this.initialEditValue.plateNumber ||
			currentValue.capacityValue !==
				this.initialEditValue.capacityValue ||
			currentValue.capacityUnit !== this.initialEditValue.capacityUnit ||
			currentValue.operationalStatusCode !==
				this.initialEditValue.operationalStatusCode ||
			currentValue.remarks !== this.initialEditValue.remarks ||
			currentValue.isActive !== this.initialEditValue.isActive;

		if (!hasChanges) {
			return;
		}

		this.isLoading = true;

		this.unitService
			.updateUnit(uuid, payload)
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
						'Equipment unit successfully updated.',
						'success',
					);

					this.loadUnits();
				},
				error: (error) => {
					this.utilityService.alert(
						'Failed',
						error?.error?.meta?.message ??
							'Failed to update equipment unit.',
						'error',
					);
				},
			});
	}

	getUnitStatusLabel(unit: Unit): string {
		if (!this.isActive(unit)) {
			return 'Inactive';
		}

		return (
			unit.operationalStatusName ||
			unit.operationalStatusCode ||
			'Available'
		);
	}

	isMaintenance(unit: Unit): boolean {
		return (
			this.isActive(unit) &&
			String(unit.operationalStatusCode || '').toUpperCase() ===
				'MAINTENANCE'
		);
	}
}
