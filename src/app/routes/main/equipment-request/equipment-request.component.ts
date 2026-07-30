import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import {
	Subject,
	debounceTime,
	distinctUntilChanged,
	finalize,
	forkJoin,
	takeUntil,
} from 'rxjs';

import { MainService } from '../main.service';
import { UtilityService } from 'src/app/shared/utility/utility.service';
import {
	EquipmentRequestDetailDialogComponent,
	EquipmentRequestDetailDialogData,
} from './equipment-request-detail-dialog/equipment-request-detail-dialog.component';
import {
	EquipmentRequestFormDialogComponent,
	EquipmentRequestFormDialogData,
} from './equipment-request-form-dialog/equipment-request-form-dialog.component';
import {
	EquipmentCategoryOption,
	EquipmentRequestCompanyOption,
	EquipmentRequestDivisionOption,
	EquipmentRequestMaster,
	EquipmentRequestService,
	EquipmentRequestStatusOption,
	EquipmentUnitOption,
} from './equipment-request.service';

@Component({
	selector: 'app-equipment-request',
	templateUrl: './equipment-request.component.html',
	styleUrls: ['./equipment-request.component.scss'],
	standalone: false,
})
export class EquipmentRequestComponent implements OnInit, OnDestroy {
	private readonly destroy$ = new Subject<void>();

	readonly searchControl = new FormControl('', { nonNullable: true });
	readonly statusControl = new FormControl('all', { nonNullable: true });
	readonly startDateControl = new FormControl('', { nonNullable: true });
	readonly endDateControl = new FormControl('', { nonNullable: true });

	requests: EquipmentRequestMaster[] = [];
	filteredRequests: EquipmentRequestMaster[] = [];
	company: EquipmentRequestCompanyOption | null = null;
	divisions: EquipmentRequestDivisionOption[] = [];
	categories: EquipmentCategoryOption[] = [];
	units: EquipmentUnitOption[] = [];
	statuses: EquipmentRequestStatusOption[] = [];
	isLoading = false;
	deletingUuid = '';
	actionUuid = '';
	errorMessage = '';

	constructor(
		private readonly equipmentRequestService: EquipmentRequestService,
		private readonly mainService: MainService,
		private readonly utilityService: UtilityService,
		private readonly dialog: MatDialog,
	) {}

	ngOnInit(): void {
		this.searchControl.valueChanges
			.pipe(
				debounceTime(250),
				distinctUntilChanged(),
				takeUntil(this.destroy$),
			)
			.subscribe(() => this.applyFilters());

		this.statusControl.valueChanges
			.pipe(takeUntil(this.destroy$))
			.subscribe(() => this.applyFilters());
		this.startDateControl.valueChanges
			.pipe(takeUntil(this.destroy$))
			.subscribe(() => this.applyFilters());
		this.endDateControl.valueChanges
			.pipe(takeUntil(this.destroy$))
			.subscribe(() => this.applyFilters());

		this.loadOptions();
		this.loadRequests();
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	loadRequests(): void {
		this.isLoading = true;
		this.errorMessage = '';

		this.equipmentRequestService
			.getRequests()
			.pipe(
				takeUntil(this.destroy$),
				finalize(() => (this.isLoading = false)),
			)
			.subscribe({
				next: (requests) => {
					this.requests = requests ?? [];
					this.applyFilters();
				},
				error: (error) => {
					this.requests = [];
					this.filteredRequests = [];
					this.errorMessage =
						error?.error?.meta?.message ??
						'Failed to load equipment requests.';
				},
			});
	}

	resetFilters(): void {
		this.searchControl.setValue('', { emitEvent: false });
		this.statusControl.setValue('all', { emitEvent: false });
		this.startDateControl.setValue('', { emitEvent: false });
		this.endDateControl.setValue('', { emitEvent: false });
		this.applyFilters();
	}

	openCreateDialog(): void {
		this.openFormDialog({ mode: 'create' });
	}

	openEditDialog(request: EquipmentRequestMaster): void {
		this.equipmentRequestService.getRequest(request.uuid).subscribe({
			next: (detail) =>
				this.openFormDialog({ mode: 'edit', request: detail }),
			error: (error) =>
				this.showError(error, 'Failed to load equipment request.'),
		});
	}

	openDetailDialog(request: EquipmentRequestMaster): void {
		const dialogRef = this.dialog.open(
			EquipmentRequestDetailDialogComponent,
			{
				width: '1180px',
				maxWidth: '96vw',
				maxHeight: '94vh',
				disableClose: true,
				autoFocus: false,
				panelClass: 'equipment-request-detail-dialog-panel',
				data: <EquipmentRequestDetailDialogData>{
					requestUuid: request.uuid,
				},
			},
		);

		dialogRef
			.afterClosed()
			.pipe(takeUntil(this.destroy$))
			.subscribe((result) => {
				if (result?.action === 'refresh') this.loadRequests();
			});
	}

	async deleteRequest(request: EquipmentRequestMaster): Promise<void> {
		const confirmed = await this.utilityService.confirm(
			'Delete Equipment Request',
			`Delete draft request "${request.requestNo}"?`,
			'warning',
		);
		if (!confirmed) return;

		this.deletingUuid = request.uuid;
		this.equipmentRequestService
			.deleteRequest(request.uuid)
			.pipe(finalize(() => (this.deletingUuid = '')))
			.subscribe({
				next: () => {
					this.utilityService.alert(
						'Success',
						`Request "${request.requestNo}" berhasil dihapus.`,
						'success',
					);
					this.loadRequests();
				},
				error: (error) =>
					this.showError(
						error,
						`Request "${request.requestNo}" gagal dihapus.`,
					),
			});
	}

	canEdit(request: EquipmentRequestMaster): boolean {
		return (
			Boolean(request.statusAllowEdit) && !Boolean(request.approvalLocked)
		);
	}

	canDelete(request: EquipmentRequestMaster): boolean {
		return request.status === 'DRAFT' && !Boolean(request.approvalLocked);
	}

	statusClass(status: string): string {
		return String(status || '')
			.toLowerCase()
			.replace(/_/g, '-');
	}

	trackByUuid(_: number, request: EquipmentRequestMaster): string {
		return request.uuid;
	}

	private loadOptions(): void {
		this.mainService
			.getUser()
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (response) => {
					const companyId = Number(response?.user?.companyId);

					if (!companyId) {
						this.company = null;
						this.divisions = [];
						this.categories = [];
						this.units = [];
						this.statuses = [];
						return;
					}

					forkJoin({
						companies: this.equipmentRequestService.getCompanies(),
						divisions:
							this.equipmentRequestService.getDivisions(
								companyId,
							),
						categories:
							this.equipmentRequestService.getEquipmentCategories(),
						units: this.equipmentRequestService.getEquipmentUnits(),
						statuses:
							this.equipmentRequestService.getEquipmentRequestStatuses(),
					})
						.pipe(takeUntil(this.destroy$))
						.subscribe({
							next: (result) => {
								this.company =
									(result.companies ?? []).find(
										(item) => Number(item.id) === companyId,
									) ?? null;

								this.divisions = result.divisions ?? [];
								this.categories = result.categories ?? [];
								this.units = result.units ?? [];
								this.statuses = (result.statuses ?? [])
									.filter(
										(status) =>
											Number(status.isActive) === 1,
									)
									.sort(
										(a, b) =>
											Number(a.sortOrder) -
											Number(b.sortOrder),
									);
							},
							error: () => {
								this.divisions = [];
								this.categories = [];
								this.units = [];
								this.statuses = [];
							},
						});
				},
				error: () => {
					this.company = null;
					this.divisions = [];
					this.categories = [];
					this.units = [];
				},
			});
	}

	private openFormDialog(
		data: Omit<
			EquipmentRequestFormDialogData,
			'company' | 'divisions' | 'categories' | 'units'
		>,
	): void {
		const dialogRef = this.dialog.open(
			EquipmentRequestFormDialogComponent,
			{
				width: '1280px',
				maxWidth: '96vw',
				maxHeight: '94vh',
				disableClose: true,
				autoFocus: false,
				panelClass: 'equipment-request-form-dialog-panel',
				data: {
					...data,
					company: this.company,
					divisions: this.divisions,
					categories: this.categories,
					units: this.units,
				},
			},
		);

		dialogRef
			.afterClosed()
			.pipe(takeUntil(this.destroy$))
			.subscribe((result) => {
				if (result?.action !== 'save') return;
				this.utilityService.alert(
					'Success',
					data.mode === 'create'
						? 'Equipment request berhasil dibuat.'
						: 'Equipment request berhasil diperbarui.',
					'success',
				);
				this.loadRequests();
			});
	}

	private applyFilters(): void {
		const keyword = this.searchControl.value.trim().toLowerCase();
		const status = this.statusControl.value;
		const startDate = this.startDateControl.value;
		const endDate = this.endDateControl.value;

		this.filteredRequests = this.requests.filter((request) => {
			if (status !== 'all' && request.status !== status) return false;
			if (startDate && request.endDate < startDate) return false;
			if (endDate && request.startDate > endDate) return false;
			if (!keyword) return true;
			return [
				request.requestNo,
				request.companyName,
				request.companyCode,
				request.divisionName,
				request.requestByName,
				request.purpose,
			]
				.filter(Boolean)
				.join(' ')
				.toLowerCase()
				.includes(keyword);
		});
	}

	private showError(error: any, fallback: string): void {
		this.utilityService.alert(
			'Failed',
			error?.error?.meta?.message ?? error?.error?.message ?? fallback,
			'error',
		);
	}
}
