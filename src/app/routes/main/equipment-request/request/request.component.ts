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

import { MainService } from '../../main.service';
import { UtilityService } from 'src/app/shared/utility/utility.service';
import {
	RequestDetailDialogComponent,
	RequestDetailDialogData,
} from './request-detail-dialog/request-detail-dialog.component';
import {
	RequestFormDialogComponent,
	RequestFormDialogData,
} from './request-form-dialog/request-form-dialog.component';
import {
	CapacityUnitOption,
	CategoryOption,
	RequestCompanyOption,
	RequestDivisionOption,
	RequestMaster,
	RequestService,
	RequestStatusOption,
	UnitOption,
} from './request.service';

@Component({
	selector: 'app-request',
	templateUrl: './request.component.html',
	styleUrls: ['./request.component.scss'],
	standalone: false,
})
export class RequestComponent implements OnInit, OnDestroy {
	private readonly destroy$ = new Subject<void>();

	readonly searchControl = new FormControl('', { nonNullable: true });
	readonly statusControl = new FormControl('all', { nonNullable: true });
	readonly startDateControl = new FormControl('', { nonNullable: true });
	readonly endDateControl = new FormControl('', { nonNullable: true });

	requests: RequestMaster[] = [];
	filteredRequests: RequestMaster[] = [];
	company: RequestCompanyOption | null = null;
	divisions: RequestDivisionOption[] = [];
	categories: CategoryOption[] = [];
	units: UnitOption[] = [];
	statuses: RequestStatusOption[] = [];
	capacityUnits: CapacityUnitOption[] = [];
	isLoading = false;
	deletingUuid = '';
	actionUuid = '';
	errorMessage = '';
	submittingUuid = '';
	maxEquipmentPreview = 1;

	constructor(
		private readonly requestService: RequestService,
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

		this.loadStatuses();
		this.loadRequests();
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	loadRequests(): void {
		this.isLoading = true;
		this.errorMessage = '';

		this.requestService
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

	getEquipmentPreview(details: any[] | null | undefined): any[] {
		return (details ?? []).slice(0, this.maxEquipmentPreview);
	}

	getRemainingEquipmentCount(details: any[] | null | undefined): number {
		return Math.max((details ?? []).length - this.maxEquipmentPreview, 0);
	}

	openCreateDialog(): void {
		this.loadFormOptions(() => {
			this.openFormDialog({ mode: 'create' });
		});
	}

	openEditDialog(request: RequestMaster): void {
		this.requestService
			.getRequest(request.uuid)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (detail) => {
					this.loadFormOptions(() => {
						this.openFormDialog({
							mode: 'edit',
							request: detail,
						});
					});
				},
				error: (error) =>
					this.showError(error, 'Failed to load equipment request.'),
			});
	}

	openDetailDialog(request: RequestMaster, initialTabIndex = 0): void {
		const dialogRef = this.dialog.open(RequestDetailDialogComponent, {
			width: '1180px',
			maxWidth: '96vw',
			maxHeight: '94vh',
			disableClose: true,
			autoFocus: false,
			panelClass: 'equipment-request-detail-dialog-panel',
			data: <RequestDetailDialogData>{
				requestUuid: request.uuid,
				initialTabIndex,
			},
		});

		dialogRef
			.afterClosed()
			.pipe(takeUntil(this.destroy$))
			.subscribe((result) => {
				if (result?.action === 'refresh') this.loadRequests();
			});
	}

	async deleteRequest(request: RequestMaster): Promise<void> {
		const confirmed = await this.utilityService.confirm(
			'Delete Equipment Request',
			`Delete draft request "${request.requestNo}"?`,
			'warning',
		);
		if (!confirmed) return;

		this.deletingUuid = request.uuid;
		this.requestService
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

	canEdit(request: RequestMaster): boolean {
		return (
			Boolean(request.statusAllowEdit) && !Boolean(request.approvalLocked)
		);
	}

	canDelete(request: RequestMaster): boolean {
		return request.status === 'DRAFT' && !Boolean(request.approvalLocked);
	}

	canSubmit(request: RequestMaster): boolean {
		return (request.availableActions ?? []).some(
			(action) =>
				action.actionCode === 'SUBMIT' &&
				action.permissionCode === 'EQUIPMENT_REQUEST.SUBMIT',
		);
	}

	statusClass(status: string): string {
		return String(status || '')
			.toLowerCase()
			.replace(/_/g, '-');
	}

	trackByUuid(_: number, request: RequestMaster): string {
		return request.uuid;
	}

	private loadStatuses(): void {
		this.requestService
			.getRequestStatuses()
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (statuses) => {
					this.statuses = (statuses ?? [])
						.filter((status) => Number(status.isActive) === 1)
						.sort(
							(a, b) => Number(a.sortOrder) - Number(b.sortOrder),
						);
				},
				error: () => {
					this.statuses = [];
				},
			});
	}

	private loadFormOptions(callback: () => void): void {
		if (
			this.company &&
			this.divisions.length > 0 &&
			this.categories.length > 0 &&
			this.units.length > 0 &&
			this.capacityUnits.length > 0
		) {
			callback();
			return;
		}

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
						this.capacityUnits = [];

						this.utilityService.alert(
							'Failed',
							'Company user tidak ditemukan.',
							'error',
						);
						return;
					}

					forkJoin({
						companies: this.requestService.getCompanies(),
						divisions: this.requestService.getDivisions(companyId),
						categories: this.requestService.getCategories(),
						units: this.requestService.getUnits(),
						capacityUnits: this.requestService.getCapacityUnits(),
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
								this.capacityUnits = result.capacityUnits ?? [];

								callback();
							},
							error: (error) => {
								this.divisions = [];
								this.categories = [];
								this.units = [];
								this.capacityUnits = [];

								this.showError(
									error,
									'Failed to load equipment request form data.',
								);
							},
						});
				},
				error: (error) =>
					this.showError(error, 'Failed to load user information.'),
			});
	}

	private openFormDialog(
		data: Omit<
			RequestFormDialogData,
			'company' | 'divisions' | 'categories' | 'units' | 'capacityUnits'
		>,
	): void {
		const dialogRef = this.dialog.open(RequestFormDialogComponent, {
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
				capacityUnits: this.capacityUnits,
			},
		});

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

	getStatusDisplayName(request: RequestMaster): string {
		if (request.status === 'CLIENT_REVIEW') {
			return request.companyName
				? `Waiting ${request.companyName} Approval`
				: request.statusName || 'Waiting Client Approval';
		}

		return request.statusName || request.status;
	}

	submitRequest(request: RequestMaster): void {
		if (!this.canSubmit(request)) {
			this.utilityService.alert(
				'Failed',
				'Submit action tidak tersedia untuk request ini.',
				'error',
			);
			return;
		}

		this.submittingUuid = request.uuid;

		this.requestService
			.executeAction(request.uuid, {
				actionCode: 'SUBMIT',
				remarks: null,
			})
			.pipe(
				takeUntil(this.destroy$),
				finalize(() => {
					this.submittingUuid = '';
				}),
			)
			.subscribe({
				next: () => {
					this.utilityService.alert(
						'Success',
						'Request berhasil disubmit untuk approval.',
						'success',
					);

					this.loadRequests();
				},
				error: (error) => {
					this.utilityService.alert(
						'Failed',
						error?.error?.meta?.message ??
							error?.error?.message ??
							'Failed to submit request.',
						'error',
					);
				},
			});
	}
}
