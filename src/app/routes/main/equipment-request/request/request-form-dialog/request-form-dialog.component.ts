import {
	Component,
	ElementRef,
	Inject,
	OnDestroy,
	OnInit,
	ViewChild,
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { finalize, forkJoin, of, Subject, switchMap, takeUntil } from 'rxjs';

import { UtilityService } from 'src/app/shared/utility/utility.service';

import {
	CapacityUnitOption,
	CategoryOption,
	RequestCompanyOption,
	RequestDetail,
	RequestDivisionOption,
	RequestAttachment,
	RequestMaster,
	RequestPayload,
	RequestService,
	UnitOption,
} from '../request.service';

export interface RequestFormDialogData {
	mode: 'create' | 'edit';
	request?: RequestMaster;
	company: RequestCompanyOption | null;
	divisions: RequestDivisionOption[];
	categories: CategoryOption[];
	units: UnitOption[];
	capacityUnits: CapacityUnitOption[];
}

@Component({
	selector: 'app-request-form-dialog',
	templateUrl: './request-form-dialog.component.html',
	styleUrls: ['./request-form-dialog.component.scss'],
	standalone: false,
})
export class RequestFormDialogComponent implements OnInit, OnDestroy {
	@ViewChild('unitImageReview')
	private unitImageReview?: ElementRef<HTMLElement>;

	isSaving = false;
	errorMessage = '';
	reviewUnitUuid: string | null = null;
	attachments: RequestAttachment[] = [];
	pendingAttachments: File[] = [];
	readonly attachmentMaxCount = 5;
	readonly attachmentMaxBytes = 10 * 1024 * 1024;
	private createdRequestUuid: string | null = null;
	private readonly deletingAttachmentUuids = new Set<string>();

	private readonly destroy$ = new Subject<void>();
	private readonly unitImageUrls = new Map<string, string>();
	private readonly loadingUnitImages = new Set<string>();
	private readonly failedUnitImages = new Set<string>();

	readonly form = this.formBuilder.group({
		companyId: [this.data.company?.id ?? null, Validators.required],
		divisionUuid: [this.data.request?.divisionUuid ?? ''],
		startDate: [
			this.toDateTimeInputValue(this.data.request?.startDate),
			Validators.required,
		],
		endDate: [
			this.toDateTimeInputValue(this.data.request?.endDate),
			Validators.required,
		],
		purpose: [
			this.data.request?.purpose ?? '',
			Validators.maxLength(65535),
		],
		notes: [this.data.request?.notes ?? '', Validators.maxLength(65535)],
		details: this.formBuilder.array([]),
	});

	constructor(
		private readonly formBuilder: FormBuilder,
		private readonly requestService: RequestService,
		private readonly utilityService: UtilityService,
		private readonly dialogRef: MatDialogRef<RequestFormDialogComponent>,
		@Inject(MAT_DIALOG_DATA)
		public readonly data: RequestFormDialogData,
	) {}

	ngOnInit(): void {
		const details = this.data.request?.details ?? [];

		if (details.length) details.forEach((detail) => this.addDetail(detail));
		else this.addDetail();

		if (this.data.request?.uuid) this.loadAttachments(this.data.request.uuid);
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();

		this.unitImageUrls.forEach((url) => URL.revokeObjectURL(url));
		this.unitImageUrls.clear();
	}

	get title(): string {
		return this.data.mode === 'create'
			? 'Add Equipment Request'
			: 'Edit Equipment Request';
	}

	get details(): FormArray {
		return this.form.controls.details;
	}

	addDetail(detail?: any): void {
		this.details.push(
			this.formBuilder.group({
				uuid: [detail?.uuid ?? null],
				equipmentCategoryId: [
					detail?.equipmentCategoryId ?? null,
					[Validators.required, Validators.min(1)],
				],
				equipmentUnitId: [
					detail?.equipmentUnitId ?? null,
					Validators.required,
				],
				requiredCapacityValue: [
					detail?.requiredCapacityValue ?? null,
					[Validators.required, Validators.min(0.01)],
				],
				requiredCapacityUnit: [
					detail?.requiredCapacityUnit ?? '',
					[Validators.required, Validators.maxLength(50)],
				],
				remarks: [detail?.remarks ?? '', Validators.maxLength(1000)],
			}),
		);

		if (detail?.equipmentUnitId) {
			this.loadSelectedUnitImage(this.details.length - 1);
		}
	}

	removeDetail(index: number): void {
		if (this.details.length <= 1) return;
		this.details.removeAt(index);
	}

	getUnitsByCategory(detailIndex: number): UnitOption[] {
		const categoryId = Number(
			this.details.at(detailIndex).get('equipmentCategoryId')?.value,
		);

		if (!categoryId) return [];

		return this.data.units.filter(
			(unit) => Number(unit.categoryId) === categoryId,
		);
	}

	onCategoryChange(detailIndex: number): void {
		this.closeUnitImageReview();

		this.details.at(detailIndex).patchValue({
			equipmentUnitId: null,
			requiredCapacityValue: null,
			requiredCapacityUnit: '',
		});
	}

	onUnitChange(detailIndex: number): void {
		this.closeUnitImageReview();

		const detail = this.details.at(detailIndex);
		const equipmentUnitId = Number(detail.get('equipmentUnitId')?.value);

		const selectedUnit =
			this.data.units.find(
				(unit) => Number(unit.id) === equipmentUnitId,
			) ?? null;

		detail.patchValue({
			requiredCapacityUnit:
				selectedUnit?.capacityUnit?.trim().toUpperCase() ?? '',
		});

		this.loadSelectedUnitImage(detailIndex);
	}

	getSelectedUnit(detailIndex: number): UnitOption | null {
		const equipmentUnitId = Number(
			this.details.at(detailIndex).get('equipmentUnitId')?.value,
		);

		if (!equipmentUnitId) return null;

		return (
			this.data.units.find(
				(unit) => Number(unit.id) === equipmentUnitId,
			) ?? null
		);
	}

	getSelectedUnitImageUrl(detailIndex: number): string | null {
		const unit = this.getSelectedUnit(detailIndex);
		return unit ? (this.unitImageUrls.get(unit.uuid) ?? null) : null;
	}

	isSelectedUnitImageLoading(detailIndex: number): boolean {
		const unit = this.getSelectedUnit(detailIndex);
		return unit ? this.loadingUnitImages.has(unit.uuid) : false;
	}

	openUnitImageReview(detailIndex: number): void {
		const unit = this.getSelectedUnit(detailIndex);

		if (!unit || !this.unitImageUrls.has(unit.uuid)) return;

		this.reviewUnitUuid = unit.uuid;
		this.scrollToUnitImageReviewOnMobile();
	}

	closeUnitImageReview(): void {
		this.reviewUnitUuid = null;
	}

	get reviewedUnit(): UnitOption | null {
		if (!this.reviewUnitUuid) return null;

		return (
			this.data.units.find((unit) => unit.uuid === this.reviewUnitUuid) ??
			null
		);
	}

	get reviewedUnitImageUrl(): string | null {
		return this.reviewUnitUuid
			? (this.unitImageUrls.get(this.reviewUnitUuid) ?? null)
			: null;
	}

	private scrollToUnitImageReviewOnMobile(): void {
		if (
			typeof window === 'undefined' ||
			!window.matchMedia('(max-width: 900px)').matches
		) {
			return;
		}

		window.setTimeout(() => {
			this.unitImageReview?.nativeElement.scrollIntoView({
				behavior: 'smooth',
				block: 'start',
			});
		}, 0);
	}

	private loadSelectedUnitImage(detailIndex: number): void {
		const unit = this.getSelectedUnit(detailIndex);

		if (
			!unit?.imageUuid ||
			this.unitImageUrls.has(unit.uuid) ||
			this.loadingUnitImages.has(unit.uuid) ||
			this.failedUnitImages.has(unit.uuid)
		) {
			return;
		}

		this.loadingUnitImages.add(unit.uuid);

		this.requestService
			.getUnitImage(unit.uuid)
			.pipe(
				takeUntil(this.destroy$),
				finalize(() => this.loadingUnitImages.delete(unit.uuid)),
			)
			.subscribe({
				next: (blob) => {
					this.unitImageUrls.set(
						unit.uuid,
						URL.createObjectURL(blob),
					);
				},
				error: () => this.failedUnitImages.add(unit.uuid),
			});
	}

	save(): void {
		if (this.form.invalid) {
			this.form.markAllAsTouched();
			this.markDetailsAsTouched();
			this.errorMessage = 'Mohon lengkapi data request yang wajib diisi.';
			return;
		}

		const value = this.form.getRawValue();

		const selectedUnitIds = (value.details ?? [])
			.map((detail: any) => Number(detail.equipmentUnitId))
			.filter((unitId: number) => Number.isInteger(unitId) && unitId > 0);

		if (new Set(selectedUnitIds).size !== selectedUnitIds.length) {
			this.errorMessage =
				'Equipment unit yang sama tidak boleh dipilih lebih dari satu kali.';
			return;
		}

		const startDate = this.formatDatabaseDateTime(value.startDate);
		const endDate = this.formatDatabaseDateTime(value.endDate);

		if (!startDate || !endDate) {
			this.errorMessage = 'Format tanggal dan waktu tidak valid.';
			return;
		}
		if (startDate >= endDate) {
			this.errorMessage = 'End date harus lebih besar dari start date.';
			return;
		}

		const payload: RequestPayload = {
			companyUuid: this.data.company?.uuid ?? null,
			divisionUuid: value.divisionUuid || null,
			startDate,
			endDate,
			purpose: value.purpose?.trim() || null,
			notes: value.notes?.trim() || null,
			details: (value.details ?? []).map((detail: any) => ({
				uuid: detail.uuid || null,
				equipmentCategoryId: Number(detail.equipmentCategoryId),
				equipmentUnitId: Number(detail.equipmentUnitId),
				requiredCapacityValue: Number(detail.requiredCapacityValue),
				requiredCapacityUnit:
					detail.requiredCapacityUnit?.trim().toUpperCase() || '',
				remarks: detail.remarks?.trim() || null,
			})),
		};

		this.isSaving = true;
		this.errorMessage = '';

		const existingRequestUuid = this.data.request?.uuid || this.createdRequestUuid;
		const request$ = existingRequestUuid
			? this.requestService.updateRequest(existingRequestUuid, payload)
			: this.requestService.createRequest(payload);

		request$
			.pipe(
				switchMap((savedRequest) => {
					if (this.data.mode === 'create' && savedRequest?.uuid) this.createdRequestUuid = savedRequest.uuid;
					if (!savedRequest?.uuid || !this.pendingAttachments.length) return of(savedRequest);
					return forkJoin(
						this.pendingAttachments.map((file) =>
							this.requestService.uploadAttachment(savedRequest.uuid, file),
						),
					).pipe(switchMap(() => of(savedRequest)));
				}),
				finalize(() => (this.isSaving = false)),
			)
			.subscribe({
			next: () => this.dialogRef.close({ action: 'save' }),
			error: (error) => {
				const message = error?.error?.meta?.message ?? 'Failed to save equipment request.';
				if (this.createdRequestUuid) {
					this.errorMessage = `Request sudah tersimpan, tetapi attachment gagal: ${message}. Silakan pilih ulang file yang gagal lalu Save kembali.`;
					this.pendingAttachments = [];
					this.loadAttachments(this.createdRequestUuid);
				} else {
					this.errorMessage = message;
				}
			},
		});
	}

	selectAttachments(event: Event): void {
		const input = event.target as HTMLInputElement;
		const files = Array.from(input.files ?? []);
		input.value = '';
		this.errorMessage = '';

		for (const file of files) {
			if (this.attachments.length + this.pendingAttachments.length >= this.attachmentMaxCount) {
				this.errorMessage = `Maksimal ${this.attachmentMaxCount} attachment per request.`;
				break;
			}
			if (file.size > this.attachmentMaxBytes) {
				this.errorMessage = `${file.name} melebihi batas 10 MB.`;
				continue;
			}
			if (!['application/pdf','image/jpeg','image/png','image/gif','image/webp'].includes(file.type)) {
				this.errorMessage = `${file.name} bukan PDF/image yang didukung.`;
				continue;
			}
			this.pendingAttachments.push(file);
		}
	}

	removePendingAttachment(index: number): void {
		this.pendingAttachments.splice(index, 1);
	}

	async removeSavedAttachment(attachment: RequestAttachment): Promise<void> {
		const requestUuid = this.data.request?.uuid || this.createdRequestUuid;

		if (
			!requestUuid ||
			!this.canManageSavedAttachments ||
			this.deletingAttachmentUuids.has(attachment.uuid)
		) {
			return;
		}

		const confirmed = await this.utilityService.confirm(
			'Remove Attachment',
			`Remove ${attachment.originalName} from this request?`,
			'warning',
		);

		if (!confirmed) {
			return;
		}

		this.errorMessage = '';
		this.deletingAttachmentUuids.add(attachment.uuid);

		this.requestService
			.deleteAttachment(requestUuid, attachment.uuid)
			.pipe(
				takeUntil(this.destroy$),
				finalize(() => this.deletingAttachmentUuids.delete(attachment.uuid)),
			)
			.subscribe({
				next: () => {
					this.attachments = this.attachments.filter(
						(item) => item.uuid !== attachment.uuid,
					);
				},
				error: (error) => {
					this.errorMessage =
						error?.error?.meta?.message ??
						'Failed to remove attachment.';
				},
			});
	}

	get canManageSavedAttachments(): boolean {
		return (
			this.data.mode === 'edit' &&
			this.data.request?.statusAllowEdit === true &&
			!this.isSaving
		);
	}

	isDeletingAttachment(attachmentUuid: string): boolean {
		return this.deletingAttachmentUuids.has(attachmentUuid);
	}

	formatFileSize(bytes: number): string {
		if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	}

	private loadAttachments(requestUuid: string): void {
		this.requestService.getAttachments(requestUuid).pipe(takeUntil(this.destroy$)).subscribe({
			next: (attachments) => (this.attachments = attachments ?? []),
			error: () => (this.attachments = []),
		});
	}

	cancel(): void {
		if (!this.isSaving) this.dialogRef.close();
	}

	getCategoryByDetail(index: number): CategoryOption | null {
		const categoryId = Number(
			this.details.at(index).get('equipmentCategoryId')?.value,
		);

		if (!categoryId) {
			return null;
		}

		return (
			this.data.categories.find(
				(category) => Number(category.id) === categoryId,
			) ?? null
		);
	}

	getCategoryIcon(index: number): string {
		const category = this.getCategoryByDetail(index);
		const icon = category?.icon?.trim() || 'equipment.svg';

		return `assets/icons/equipment/${icon}`;
	}

	private markDetailsAsTouched(): void {
		this.details.controls.forEach((control) => {
			control.markAllAsTouched();
			control.updateValueAndValidity();
		});
	}

	private formatDatabaseDateTime(value: string | Date | null): string | null {
		if (!value) return null;

		if (typeof value === 'string') {
			const normalizedValue = value.trim();

			if (!normalizedValue) return null;

			const match = normalizedValue.match(
				/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/,
			);

			if (!match) return null;

			const [, year, month, day, hour, minute] = match;

			return `${year}-${month}-${day} ${hour}:${minute}:00`;
		}

		if (Number.isNaN(value.getTime())) return null;

		return this.formatLocalDateTime(value, 'database');
	}

	private toDateTimeInputValue(
		value: string | Date | null | undefined,
	): string {
		if (!value) return '';

		if (typeof value === 'string') {
			const normalizedValue = value.trim();

			const localDateTimeMatch = normalizedValue.match(
				/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/,
			);

			if (localDateTimeMatch) {
				const [, year, month, day, hour, minute] = localDateTimeMatch;

				return `${year}-${month}-${day}T${hour}:${minute}`;
			}
		}

		const date = value instanceof Date ? value : new Date(value);

		if (Number.isNaN(date.getTime())) return '';

		return this.formatLocalDateTime(date, 'input');
	}

	private formatLocalDateTime(
		date: Date,
		target: 'input' | 'database',
	): string {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		const hour = String(date.getHours()).padStart(2, '0');
		const minute = String(date.getMinutes()).padStart(2, '0');

		if (target === 'input') {
			return `${year}-${month}-${day}T${hour}:${minute}`;
		}

		return `${year}-${month}-${day} ${hour}:${minute}:00`;
	}
}
