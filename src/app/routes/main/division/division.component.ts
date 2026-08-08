import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import {
	Subject,
	catchError,
	debounceTime,
	distinctUntilChanged,
	finalize,
	forkJoin,
	of,
	takeUntil,
} from 'rxjs';

import { UtilityService } from 'src/app/shared/utility/utility.service';

import { DivisionDialogComponent } from './division-dialog/division-dialog.component';
import {
	Division,
	DivisionDialogResult,
	DivisionService,
} from './division.service';

import { Company, CompanyService } from '../company/company.service';
import { AppDialogService } from 'src/app/shared/dialog/app-dialog.service';

type DivisionStatusFilter = 'all' | 'active' | 'inactive';

@Component({
	selector: 'app-division',
	templateUrl: './division.component.html',
	styleUrls: ['./division.component.scss'],
	standalone: false,
})
export class DivisionComponent implements OnInit, OnDestroy {
	private readonly destroy$ = new Subject<void>();

	private initialEditValue: {
		companyUuid: string;
		name: string;
		code: string;
		description: string;
		isActive: boolean;
	} | null = null;

	search = new FormControl('', {
		nonNullable: true,
	});

	companyUuid = new FormControl<string>('all', {
		nonNullable: true,
	});

	status = new FormControl<DivisionStatusFilter>('all', {
		nonNullable: true,
	});

	divisions: Division[] = [];
	filteredDivisions: Division[] = [];
	companies: Company[] = [];

	isLoading = false;
	errorMessage = '';

	displayedColumns = [
		'name',
		'code',
		'company',
		'description',
		'status',
		'actions',
	];

	constructor(
		private divisionService: DivisionService,
		private companyService: CompanyService,
		private dialog: AppDialogService,
		private utilityService: UtilityService,
	) {}

	ngOnInit(): void {
		this.search.valueChanges
			.pipe(
				debounceTime(250),
				distinctUntilChanged(),
				takeUntil(this.destroy$),
			)
			.subscribe(() => this.applyFilters());

		this.companyUuid.valueChanges
			.pipe(takeUntil(this.destroy$))
			.subscribe(() => this.applyFilters());

		this.status.valueChanges
			.pipe(takeUntil(this.destroy$))
			.subscribe(() => this.applyFilters());

		this.loadData();
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	loadData(): void {
		this.isLoading = true;
		this.errorMessage = '';

		forkJoin({
			divisions: this.divisionService.getDivisions().pipe(
				catchError((error) => {
					this.errorMessage =
						error?.error?.meta?.message ??
						'Failed to load divisions.';

					return of([]);
				}),
			),
			companies: this.companyService.getCompanies().pipe(
				catchError((error) => {
					this.errorMessage =
						error?.error?.meta?.message ??
						'Failed to load companies.';

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
			.subscribe({
				next: ({ divisions, companies }) => {
					this.divisions = divisions ?? [];

					this.companies = (companies ?? [])
						.filter((company: Company) => company.isActive)
						.sort((a: Company, b: Company) =>
							a.name.localeCompare(b.name),
						);

					this.applyFilters();
				},
			});
	}

	private loadDivisions(): void {
		this.divisionService
			.getDivisions()
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (divisions) => {
					this.divisions = divisions ?? [];
					this.applyFilters();
				},
				error: (error) => {
					this.errorMessage =
						error?.error?.meta?.message ??
						'Failed to load divisions.';
				},
			});
	}

	openCreateDialog(event: MouseEvent): void {
		const dialogRef = this.dialog.open(DivisionDialogComponent, {
			origin: event.currentTarget as HTMLElement,
			width: '720px',
			disableClose: true,
			data: {
				mode: 'create',
				companies: this.companies,
			},
		});

		dialogRef
			.afterClosed()
			.pipe(takeUntil(this.destroy$))
			.subscribe((result?: DivisionDialogResult) => {
				if (!result) {
					return;
				}

				this.createDivision(result);
			});
	}

	openEditDialog(division: Division, event: MouseEvent): void {
		const companies = this.getDialogCompanies(division);

		this.initialEditValue = {
			companyUuid: division.companyUuid,
			name: (division.name ?? '').trim(),
			code: (division.code ?? '').trim(),
			description: (division.description ?? '').trim(),
			isActive: Boolean(division.isActive),
		};

		const dialogRef = this.dialog.open(DivisionDialogComponent, {
			origin: event.currentTarget as HTMLElement,
			width: '720px',
			disableClose: true,
			data: {
				mode: 'edit',
				division,
				companies,
			},
		});

		dialogRef
			.afterClosed()
			.pipe(takeUntil(this.destroy$))
			.subscribe((result?: DivisionDialogResult) => {
				if (!result) {
					return;
				}

				this.updateDivision(division, result);
			});
	}

	async deactivateDivision(division: Division): Promise<void> {
		const confirmed = await this.utilityService.confirm(
			'Deactivate Division',
			`Deactivate division "${division.name}"?`,
			'warning',
		);

		if (!confirmed) {
			return;
		}

		this.isLoading = true;
		this.errorMessage = '';

		this.divisionService
			.deactivateDivision(division.uuid)
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
						`Division "${division.name}" berhasil dinonaktifkan.`,
						'success',
					);

					this.loadDivisions();
				},
				error: (error) => {
					this.utilityService.alert(
						'Error',
						error?.error?.meta?.message ??
							'Division gagal dinonaktifkan.',
						'error',
					);
				},
			});
	}

	resetFilters(): void {
		this.search.setValue('', {
			emitEvent: false,
		});

		this.companyUuid.setValue('all', {
			emitEvent: false,
		});

		this.status.setValue('all', {
			emitEvent: false,
		});

		this.applyFilters();
	}

	trackByDivisionId(index: number, division: Division): number {
		return division.id;
	}

	private createDivision(result: DivisionDialogResult): void {
		this.isLoading = true;
		this.errorMessage = '';

		this.divisionService
			.createDivision(result.payload)
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
						'Division berhasil ditambahkan.',
						'success',
					);

					this.loadDivisions();
				},
				error: (error) => {
					this.utilityService.alert(
						'Error',
						error?.error?.meta?.message ??
							'Division gagal ditambahkan.',
						'error',
					);
				},
			});
	}

	private updateDivision(
		division: Division,
		result: DivisionDialogResult,
	): void {
		const currentValue = {
			companyUuid: result.payload.companyUuid,
			name: (result.payload.name ?? '').trim(),
			code: (result.payload.code ?? '').trim(),
			description: (result.payload.description ?? '').trim(),
			isActive: Boolean(result.payload.isActive),
		};

		const hasChanges =
			!this.initialEditValue ||
			currentValue.companyUuid !== this.initialEditValue.companyUuid ||
			currentValue.name !== this.initialEditValue.name ||
			currentValue.code !== this.initialEditValue.code ||
			currentValue.description !== this.initialEditValue.description ||
			currentValue.isActive !== this.initialEditValue.isActive;

		if (!hasChanges) {
			return;
		}

		this.isLoading = true;
		this.errorMessage = '';

		this.divisionService
			.updateDivision(division.uuid, result.payload)
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
						`Division "${result.payload.name}" berhasil diperbarui.`,
						'success',
					);

					this.loadDivisions();
				},
				error: (error) => {
					this.utilityService.alert(
						'Error',
						error?.error?.meta?.message ??
							'Division gagal diperbarui.',
						'error',
					);
				},
			});
	}

	private applyFilters(): void {
		const searchValue = this.search.value.trim().toLowerCase();
		const selectedCompanyUuid = this.companyUuid.value;
		const selectedStatus = this.status.value;

		this.filteredDivisions = this.divisions
			.filter((division) => {
				if (
					selectedCompanyUuid !== 'all' &&
					division.companyUuid !== selectedCompanyUuid
				) {
					return false;
				}

				if (selectedStatus === 'active' && !division.isActive) {
					return false;
				}

				if (selectedStatus === 'inactive' && division.isActive) {
					return false;
				}

				if (!searchValue) {
					return true;
				}

				const searchableValue = [
					division.code,
					division.name,
					division.description,
					division.companyCode,
					division.companyName,
				]
					.filter(Boolean)
					.join(' ')
					.toLowerCase();

				return searchableValue.includes(searchValue);
			})
			.sort((a, b) => {
				const companyComparison = a.companyName.localeCompare(
					b.companyName,
				);

				if (companyComparison !== 0) {
					return companyComparison;
				}

				return a.name.localeCompare(b.name);
			});
	}

	private getDialogCompanies(division: Division): Company[] {
		const companyExists = this.companies.some(
			(company) => company.uuid === division.companyUuid,
		);

		if (companyExists) {
			return this.companies;
		}

		return [
			...this.companies,
			{
				id: division.companyId,
				uuid: division.companyUuid,
				code: division.companyCode,
				name: division.companyName,
				isActive: false,
			},
		].sort((a, b) => a.name.localeCompare(b.name));
	}
}
