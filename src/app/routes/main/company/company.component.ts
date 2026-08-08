import {
	AfterViewInit,
	Component,
	OnDestroy,
	OnInit,
	ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { catchError, finalize, forkJoin, of, Subject, takeUntil } from 'rxjs';

import { UtilityService } from '../../../shared/utility/utility.service';
import {
	Lookup,
	LookupService,
} from '../../../shared/sys-lookup/lookup.service';

import {
	Company,
	CompanyDialogResult,
	CompanyService,
	CompanyType,
} from './company.service';
import { CompanyDialogComponent } from './company-dialog/company-dialog.component';
import { AppDialogService } from '../../../shared/dialog/app-dialog.service';

type CompanyStatusFilter = 'all' | 'active' | 'inactive';

@Component({
	selector: 'app-company',
	templateUrl: './company.component.html',
	styleUrls: ['./company.component.scss'],
	standalone: false,
})
export class CompanyComponent implements OnInit, AfterViewInit, OnDestroy {
	@ViewChild(MatSort)
	sort!: MatSort;

	private readonly destroy$ = new Subject<void>();

	readonly searchControl = new FormControl<string>('', {
		nonNullable: true,
	});

	readonly typeControl = new FormControl<number | 'all'>('all', {
		nonNullable: true,
	});

	readonly statusControl = new FormControl<CompanyStatusFilter>('all', {
		nonNullable: true,
	});

	readonly displayedColumns: string[] = [
		'name',
		'type',
		'contact',
		'location',
		'status',
		'actions',
	];

	companyTypes: CompanyType[] = [];
	companies: Company[] = [];

	dataSource = new MatTableDataSource<Company>([]);

	isLoading = false;
	errorMessage = '';

	constructor(
		private companyService: CompanyService,
		private lookupService: LookupService,
		private utilityService: UtilityService,
		private dialog: AppDialogService,
	) {}

	ngOnInit(): void {
		this.initializeFilter();
		this.loadInitialData();
	}

	ngAfterViewInit(): void {
		this.dataSource.sort = this.sort;

		this.dataSource.sortingDataAccessor = (
			company: Company,
			column: string,
		): string | number => {
			switch (column) {
				case 'type':
					return company.typeName ?? company.typeCode ?? '';

				case 'status':
					return this.isActive(company) ? 1 : 0;

				case 'location':
					return [company.city, company.province]
						.filter(Boolean)
						.join(' ');

				default:
					return (
						(company[column as keyof Company] as
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
			companies: this.companyService.getCompanies(),
			companyTypes: this.lookupService.getLookupsByGroup('company_type'),
		})
			.pipe(
				takeUntil(this.destroy$),
				catchError((error) => {
					this.errorMessage =
						error?.error?.meta?.message ??
						'Failed to load company data.';

					return of({
						companies: [] as Company[],
						companyTypes: [] as Lookup[],
					});
				}),
				finalize(() => {
					this.isLoading = false;
				}),
			)
			.subscribe(({ companies, companyTypes }) => {
				this.companies = companies ?? [];

				const mappedCompanyTypes: CompanyType[] = (companyTypes ?? [])
					.filter((lookup: Lookup) => this.isLookupActive(lookup))
					.map(
						(lookup: Lookup): CompanyType => ({
							id: lookup.lookupId,
							code: lookup.lookupCode,
							name: lookup.lookupValue,
						}),
					);

				this.companyTypes = mappedCompanyTypes.sort(
					(a: CompanyType, b: CompanyType) =>
						a.name.localeCompare(b.name),
				);

				this.applyFilters();
			});
	}

	loadCompanies(): void {
		this.isLoading = true;
		this.errorMessage = '';

		this.companyService
			.getCompanies()
			.pipe(
				takeUntil(this.destroy$),
				catchError((error) => {
					this.errorMessage =
						error?.error?.meta?.message ??
						'Failed to load companies.';

					return of([]);
				}),
				finalize(() => {
					this.isLoading = false;
				}),
			)
			.subscribe((companies: Company[]) => {
				this.companies = companies ?? [];
				this.applyFilters();
			});
	}

	trackByCompanyId(index: number, company: Company): number | string {
		return company.id ?? company.uuid ?? index;
	}

	getCompanyLocation(company: Company): string {
		return [company.city, company.province]
			.filter(
				(value): value is string =>
					typeof value === 'string' && value.trim().length > 0,
			)
			.join(', ');
	}

	openCreateDialog(event: MouseEvent): void {
		if (this.companyTypes.length === 0) {
			this.utilityService.alert(
				'Failed',
				'Company type lookup is not available.',
				'error',
			);

			return;
		}

		const dialogRef = this.dialog.open(CompanyDialogComponent, {
			origin: event.currentTarget as HTMLElement,
			width: '900px',
			maxWidth: '95vw',
			disableClose: true,
			data: {
				mode: 'create',
				companyTypes: this.companyTypes,
			},
		});

		dialogRef
			.afterClosed()
			.pipe(takeUntil(this.destroy$))
			.subscribe((result: CompanyDialogResult | undefined) => {
				if (!result || result.action !== 'save') {
					return;
				}

				this.createCompany(result.payload);
			});
	}

	openEditDialog(company: Company, event: MouseEvent): void {
		const dialogRef = this.dialog.open(CompanyDialogComponent, {
			width: '900px',
			maxWidth: '95vw',
			disableClose: true,
			origin: event.currentTarget as HTMLElement,
			data: {
				mode: 'edit',
				company,
				companyTypes: this.getDialogCompanyTypes(company),
			},
		});

		dialogRef
			.afterClosed()
			.pipe(takeUntil(this.destroy$))
			.subscribe((result: CompanyDialogResult | undefined) => {
				if (!result || result.action !== 'save') {
					return;
				}

				this.updateCompany(company.uuid, result.payload);
			});
	}

	async deactivateCompany(company: Company): Promise<void> {
		const confirmed = await this.utilityService.confirm(
			'Deactivate Company',
			`Are you sure you want to deactivate "${company.name}"?`,
			'warning',
		);

		if (!confirmed) {
			return;
		}

		this.isLoading = true;

		this.companyService
			.deactivateCompany(company.uuid)
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
						'Company successfully deactivated.',
						'success',
					);

					this.loadCompanies();
				},
				error: (error) => {
					this.utilityService.alert(
						'Failed',
						error?.error?.meta?.message ??
							'Failed to deactivate company.',
						'error',
					);
				},
			});
	}

	resetFilters(): void {
		this.searchControl.setValue('', {
			emitEvent: false,
		});

		this.typeControl.setValue('all', {
			emitEvent: false,
		});

		this.statusControl.setValue('all', {
			emitEvent: false,
		});

		this.applyFilters();
	}

	isActive(company: Company): boolean {
		return company.isActive === true || company.isActive === 1;
	}

	get hasFilters(): boolean {
		return (
			this.searchControl.value.trim() !== '' ||
			this.typeControl.value !== 'all' ||
			this.statusControl.value !== 'all'
		);
	}

	private initializeFilter(): void {
		this.searchControl.valueChanges
			.pipe(takeUntil(this.destroy$))
			.subscribe(() => this.applyFilters());

		this.typeControl.valueChanges
			.pipe(takeUntil(this.destroy$))
			.subscribe(() => this.applyFilters());

		this.statusControl.valueChanges
			.pipe(takeUntil(this.destroy$))
			.subscribe(() => this.applyFilters());
	}

	private applyFilters(): void {
		const search = this.searchControl.value.trim().toLowerCase();
		const typeId = this.typeControl.value;
		const status = this.statusControl.value;

		const filteredCompanies = this.companies.filter((company) => {
			const searchableText = [
				company.code,
				company.name,
				company.typeCode,
				company.typeName,
				company.taxNumber,
				company.email,
				company.phone,
				company.address,
				company.city,
				company.province,
				company.postalCode,
			]
				.filter(Boolean)
				.join(' ')
				.toLowerCase();

			const matchesSearch = !search || searchableText.includes(search);

			const matchesType = typeId === 'all' || company.typeId === typeId;

			const companyIsActive = this.isActive(company);

			const matchesStatus =
				status === 'all' ||
				(status === 'active' && companyIsActive) ||
				(status === 'inactive' && !companyIsActive);

			return matchesSearch && matchesType && matchesStatus;
		});

		this.dataSource.data = filteredCompanies;
	}

	private createCompany(payload: CompanyDialogResult['payload']): void {
		this.isLoading = true;

		this.companyService
			.createCompany(payload)
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
						'Company successfully created.',
						'success',
					);

					this.loadCompanies();
				},
				error: (error) => {
					this.utilityService.alert(
						'Failed',
						error?.error?.meta?.message ??
							'Failed to create company.',
						'error',
					);
				},
			});
	}

	private updateCompany(
		uuid: string,
		payload: CompanyDialogResult['payload'],
	): void {
		this.isLoading = true;

		this.companyService
			.updateCompany(uuid, payload)
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
						'Company successfully updated.',
						'success',
					);

					this.loadCompanies();
				},
				error: (error) => {
					this.utilityService.alert(
						'Failed',
						error?.error?.meta?.message ??
							'Failed to update company.',
						'error',
					);
				},
			});
	}

	private getDialogCompanyTypes(company: Company): CompanyType[] {
		if (!company.typeId) {
			return this.companyTypes;
		}

		const typeExists = this.companyTypes.some(
			(type) => type.id === company.typeId,
		);

		if (typeExists) {
			return this.companyTypes;
		}

		return [
			...this.companyTypes,
			{
				id: company.typeId,
				code: company.typeCode ?? '',
				name:
					company.typeName ??
					company.typeCode ??
					`Type ${company.typeId}`,
			},
		].sort((a, b) => a.name.localeCompare(b.name));
	}

	private isLookupActive(lookup: Lookup): boolean {
		return lookup.isActive === true || lookup.isActive === 1;
	}
}
