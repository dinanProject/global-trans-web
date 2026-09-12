import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, finalize, takeUntil } from 'rxjs';
import { FormBuilder, Validators } from '@angular/forms';

import { UtilityService } from 'src/app/shared/utility/utility.service';
import {
	RequestAction,
	RequestAttachment,
	RequestDetail,
	RequestMaster,
	RequestService,
} from '../../request/request.service';
import { ApprovalService } from '../approvals.service';
import { MainService } from '../../../main.service';

@Component({
	selector: 'app-approval-review',
	templateUrl: './approval-review.component.html',
	styleUrls: ['./approval-review.component.scss'],
	standalone: false,
})
export class ApprovalReviewComponent implements OnInit, OnDestroy {
	@ViewChild('unitImagePreviewDialog')
	private unitImagePreviewDialog!: TemplateRef<unknown>;
	private unitImagePreviewDialogRef: MatDialogRef<unknown> | null = null;
	private readonly destroy$ = new Subject<void>();
	readonly unitImageUrls = new Map<string, string>();
	previewUnitUuid: string | null = null;
	private readonly unavailableUnitImages = new Set<string>();
	private imageLoadVersion = 0;

	request: RequestMaster | null = null;
	attachments: RequestAttachment[] = [];

	isLoading = false;
	errorMessage = '';
	isCheckingAvailability = false;
	isProcessingAction = false;

	readonly form = this.formBuilder.group({
		startDate: ['', Validators.required],
		endDate: ['', Validators.required],
		remarks: ['', Validators.maxLength(2000)],
	});

	constructor(
		private readonly route: ActivatedRoute,
		private readonly router: Router,
		private readonly approvalService: ApprovalService,
		private readonly utilityService: UtilityService,
		private readonly formBuilder: FormBuilder,
		private readonly mainService: MainService,
		private readonly requestService: RequestService,
		private readonly dialog: MatDialog,
	) {}

	ngOnInit(): void {
		const requestUuid = this.route.snapshot.paramMap.get('uuid');

		if (!requestUuid) {
			this.errorMessage = 'Equipment request tidak ditemukan.';
			return;
		}

		this.loadReview(requestUuid);

		this.form.controls.startDate.valueChanges
			.pipe(takeUntil(this.destroy$))
			.subscribe(() => {
				this.validateSchedule();
			});

		this.form.controls.endDate.valueChanges
			.pipe(takeUntil(this.destroy$))
			.subscribe(() => {
				this.validateSchedule();
			});
	}

	ngOnDestroy(): void {
		this.unitImagePreviewDialogRef?.close();
		this.imageLoadVersion += 1;
		this.releaseUnitImages();
		this.destroy$.next();
		this.destroy$.complete();
	}

	get pageTitle(): string {
		if (this.request?.status === 'CLIENT_REVIEW') {
			return this.actions.length > 0
				? 'Exxon Approval'
				: 'Global Trans Review';
		}

		if (this.request?.status === 'GTSI_REVIEW') {
			return 'Global Trans Review';
		}

		return 'Approval Review';
	}

	get actions(): RequestAction[] {
		return this.request?.availableActions ?? [];
	}

	formatDateTime(value?: string | Date | null): string {
		if (!value) {
			return '—';
		}

		const date = new Date(value);

		if (Number.isNaN(date.getTime())) {
			return String(value);
		}

		const day = String(date.getDate()).padStart(2, '0');
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const year = date.getFullYear();
		const hour = String(date.getHours()).padStart(2, '0');
		const minute = String(date.getMinutes()).padStart(2, '0');

		return `${day}/${month}/${year} ${hour}:${minute}`;
	}

	private loadReview(requestUuid: string): void {
		this.isLoading = true;
		this.errorMessage = '';

		this.approvalService
			.getApprovalReview(requestUuid)
			.pipe(
				takeUntil(this.destroy$),
				finalize(() => {
					this.isLoading = false;
				}),
			)
			.subscribe({
				next: (request) => {
					this.request = request;
					this.loadUnitImages(request);
					this.loadAttachments(request.uuid);
					this.markNotificationAsRead(request.uuid);

					this.form.patchValue(
						{
							startDate: this.toDateTimeInputValue(
								request.startDate,
							),
							endDate: this.toDateTimeInputValue(request.endDate),
							remarks: this.getExistingApprovalRemarks(request),
						},
						{ emitEvent: false },
					);
				},
				error: (error) => {
					this.errorMessage =
						error?.error?.meta?.message ??
						error?.error?.message ??
						'Failed to load approval review.';

					this.utilityService.alert(
						'Failed',
						this.errorMessage,
						'error',
					);
				},
			});
	}

	openAttachment(attachment: RequestAttachment): void {
		if (!this.request?.uuid) return;
		this.requestService.downloadAttachment(this.request.uuid, attachment.uuid).pipe(takeUntil(this.destroy$)).subscribe({
			next: (blob) => { const url = URL.createObjectURL(blob); window.open(url, '_blank', 'noopener,noreferrer'); setTimeout(() => URL.revokeObjectURL(url), 60000); },
			error: () => this.utilityService.alert('Failed', 'Failed to open attachment.', 'error'),
		});
	}

	formatFileSize(bytes: number): string {
		if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	}

	private loadAttachments(requestUuid: string): void {
		this.requestService.getAttachments(requestUuid).pipe(takeUntil(this.destroy$)).subscribe({ next: (items) => (this.attachments = items ?? []), error: () => (this.attachments = []) });
	}

	getUnitImageUrl(unitUuid?: string | null): string | null {
		if (!unitUuid || this.unavailableUnitImages.has(unitUuid)) {
			return null;
		}

		return this.unitImageUrls.get(unitUuid) || null;
	}

	openUnitImagePreview(unitUuid?: string | null): void {
		if (!unitUuid || !this.getUnitImageUrl(unitUuid)) {
			return;
		}

		this.previewUnitUuid = unitUuid;
		const dialogRef = this.dialog.open(this.unitImagePreviewDialog, {
			width: '1040px',
			maxWidth: '94vw',
			maxHeight: '92vh',
			autoFocus: false,
			restoreFocus: true,
			panelClass: 'equipment-unit-image-preview-dialog',
		});

		this.unitImagePreviewDialogRef = dialogRef;
		dialogRef.afterClosed().subscribe(() => {
			if (this.unitImagePreviewDialogRef !== dialogRef) {
				return;
			}

			this.previewUnitUuid = null;
			this.unitImagePreviewDialogRef = null;
		});
	}

	closeUnitImagePreview(): void {
		this.unitImagePreviewDialogRef?.close();
	}

	get previewUnitDetail(): RequestDetail | null {
		if (!this.previewUnitUuid) {
			return null;
		}

		return (
			(this.request?.details || []).find(
				(detail) => detail.equipmentUnitUuid === this.previewUnitUuid,
			) || null
		);
	}

	get previewUnitImageUrl(): string | null {
		return this.previewUnitUuid
			? this.getUnitImageUrl(this.previewUnitUuid)
			: null;
	}

	private loadUnitImages(request: RequestMaster): void {
		this.imageLoadVersion += 1;
		const currentVersion = this.imageLoadVersion;
		this.releaseUnitImages();
		this.unavailableUnitImages.clear();

		const unitUuids = Array.from(
			new Set(
				(request.details || [])
					.map((detail) => detail.equipmentUnitUuid)
					.filter((uuid): uuid is string => Boolean(uuid)),
			),
		);

		unitUuids.forEach((unitUuid) => {
			this.requestService
				.getUnitImage(unitUuid)
				.pipe(takeUntil(this.destroy$))
				.subscribe({
					next: (blob) => {
						if (currentVersion !== this.imageLoadVersion) {
							return;
						}

						this.unitImageUrls.set(
							unitUuid,
							URL.createObjectURL(blob),
						);
					},
					error: () => {
						if (currentVersion === this.imageLoadVersion) {
							this.unavailableUnitImages.add(unitUuid);
						}
					},
				});
		});
	}

	private releaseUnitImages(): void {
		this.unitImageUrls.forEach((url) => URL.revokeObjectURL(url));
		this.unitImageUrls.clear();
		this.previewUnitUuid = null;
	}

	private getExistingApprovalRemarks(request: RequestMaster): string {
		const completedApproval = [...(request.approvals ?? [])]
			.filter((approval) =>
				['APPROVED', 'REJECTED'].includes(approval.status),
			)
			.sort((a, b) => {
				const levelDiff = a.approvalLevel - b.approvalLevel;
				if (levelDiff !== 0) {
					return levelDiff;
				}

				const aTime = new Date(
					a.actionDate || a.createdAt || '',
				).getTime();
				const bTime = new Date(
					b.actionDate || b.createdAt || '',
				).getTime();

				return (
					(Number.isFinite(bTime) ? bTime : 0) -
					(Number.isFinite(aTime) ? aTime : 0)
				);
			})[0];

		return completedApproval?.remarks ?? '';
	}

	private markNotificationAsRead(requestUuid: string): void {
		this.mainService
			.markMenuNotificationAsRead(requestUuid, 'EQUIPMENT_APPROVAL.VIEW')
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: ({ updatedCount }) => {
					if (updatedCount > 0) {
						this.mainService.refreshMenuUnreadCounts();
					}
				},
				error: (error: unknown) => {
					console.error(
						'Failed to mark approval notification as read',
						error,
					);
				},
			});
	}

	private validateSchedule(): boolean {
		const startDate = this.parseDateTimeLocal(
			this.form.controls.startDate.value,
		);

		const endDate = this.parseDateTimeLocal(
			this.form.controls.endDate.value,
		);

		if (!startDate || !endDate) {
			this.errorMessage = 'Format tanggal dan waktu tidak valid.';
			return false;
		}

		if (endDate < startDate) {
			this.errorMessage =
				'End date tidak boleh lebih kecil dari start date.';
			return false;
		}

		this.errorMessage = '';
		return true;
	}

	private toDateTimeInputValue(
		value: string | Date | null | undefined,
	): string {
		if (!value) {
			return '';
		}

		if (typeof value === 'string') {
			const text = value.trim();

			const localDateTimeMatch = text.match(
				/^(\d{4}-\d{2}-\d{2})[T\s](\d{2}):(\d{2})/,
			);

			if (
				localDateTimeMatch &&
				!/[zZ]$/.test(text) &&
				!/[+-]\d{2}:\d{2}$/.test(text)
			) {
				return (
					`${localDateTimeMatch[1]}T` +
					`${localDateTimeMatch[2]}:` +
					`${localDateTimeMatch[3]}`
				);
			}

			const date = new Date(text);

			if (Number.isNaN(date.getTime())) {
				return '';
			}

			return this.formatLocalDateTime(date);
		}

		if (Number.isNaN(value.getTime())) {
			return '';
		}

		return this.formatLocalDateTime(value);
	}

	private formatLocalDateTime(date: Date): string {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		const hour = String(date.getHours()).padStart(2, '0');
		const minute = String(date.getMinutes()).padStart(2, '0');

		return `${year}-${month}-${day}T${hour}:${minute}`;
	}

	private parseDateTimeLocal(value?: string | null): Date | null {
		if (!value) {
			return null;
		}

		const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);

		if (!match) {
			return null;
		}

		const [, year, month, day, hour, minute] = match;

		const date = new Date(
			Number(year),
			Number(month) - 1,
			Number(day),
			Number(hour),
			Number(minute),
			0,
			0,
		);

		if (
			date.getFullYear() !== Number(year) ||
			date.getMonth() + 1 !== Number(month) ||
			date.getDate() !== Number(day) ||
			date.getHours() !== Number(hour) ||
			date.getMinutes() !== Number(minute)
		) {
			return null;
		}

		return date;
	}

	getInfoTitle(): string {
		if (this.isClientReview()) {
			return 'Review Exxon approval';
		}

		return 'Request review';
	}

	getInfoDescription(): string {
		if (this.isClientReview()) {
			return 'Review equipment dan planned period request sebelum final approval.';
		}

		return 'Global Trans dapat memonitor request dan planned period tanpa approval action.';
	}

	getRemarksPlaceholder(): string {
		if (this.isClientReview()) {
			return 'Contoh: Jadwal sudah sesuai dengan kebutuhan operasional.';
		}

		return 'Contoh: Reschedule jadwal karena unit baru tersedia pada tanggal tersebut.';
	}

	isClientReview(): boolean {
		return this.actions.some((action) =>
			['APPROVE_CLIENT', 'REJECT_CLIENT'].includes(action.actionCode),
		);
	}

	isApproveAction(action: RequestAction): boolean {
		return ['APPROVE_CLIENT', 'APPROVE_GTSI'].includes(action.actionCode);
	}

	isRejectAction(action: RequestAction): boolean {
		return ['REJECT_CLIENT', 'REJECT_GTSI'].includes(action.actionCode);
	}

	get approveActions(): RequestAction[] {
		return this.actions.filter((action) => this.isApproveAction(action));
	}

	get rejectActions(): RequestAction[] {
		return this.actions.filter((action) => this.isRejectAction(action));
	}

	get isActionBusy(): boolean {
		return this.isProcessingAction || this.isCheckingAvailability;
	}

	private returnAfterSuccess(): void {
		this.backToApprovals();
	}

	private executeAction(payload: {
		actionCode: string;
		startDate: string;
		endDate: string;
		remarks: string | null;
	}): void {
		if (!this.request || this.isProcessingAction) {
			return;
		}

		this.isProcessingAction = true;
		this.errorMessage = '';

		this.approvalService
			.executeAction(this.request.uuid, payload)
			.pipe(
				takeUntil(this.destroy$),
				finalize(() => {
					this.isProcessingAction = false;
				}),
			)
			.subscribe({
				next: () => {
					const isReject = ['REJECT_CLIENT', 'REJECT_GTSI'].includes(
						payload.actionCode,
					);

					if (payload.actionCode === 'APPROVE_GTSI') {
						this.mainService.refreshMenuUnreadCounts();
					}

					this.utilityService.alert(
						'Success',
						isReject
							? 'Equipment request rejected successfully.'
							: 'Equipment request approved successfully.',
						'success',
					);

					this.returnAfterSuccess();
				},
				error: (error) => {
					this.errorMessage =
						error?.error?.meta?.message ??
						error?.error?.message ??
						'Failed to process approval action.';

					this.utilityService.alert(
						'Failed',
						this.errorMessage,
						'error',
					);
				},
			});
	}

	private recheckAndExecute(payload: {
		actionCode: string;
		startDate: string;
		endDate: string;
		remarks: string | null;
	}): void {
		if (!this.request) {
			return;
		}

		this.isCheckingAvailability = true;
		this.errorMessage = '';

		this.approvalService
			.getApprovalReview(this.request.uuid, {
				startDate: payload.startDate,
				endDate: payload.endDate,
			})
			.pipe(
				takeUntil(this.destroy$),
				finalize(() => {
					this.isCheckingAvailability = false;
				}),
			)
			.subscribe({
				next: (review) => {
					this.request = {
						...this.request!,
						details: review.details ?? [],
						availableActions:
							review.availableActions ??
							this.request!.availableActions,
					};

					const unavailableDetails = (
						this.request.details ?? []
					).filter(
						(detail) =>
							!detail.availability?.isAvailableForRequestedPeriod,
					);

					if (unavailableDetails.length > 0) {
						this.errorMessage =
							`${unavailableDetails.length} equipment unit ` +
							'tidak tersedia pada periode yang dipilih. ' +
							'Periksa availability equipment sebelum melanjutkan.';

						return;
					}

					this.executeAction(payload);
				},
				error: (error) => {
					this.errorMessage =
						error?.error?.meta?.message ??
						error?.error?.message ??
						'Failed to check equipment availability.';
				},
			});
	}

	backToApprovals(): void {
		this.router.navigate(['/equipment-request/approvals']);
	}

	submitAction(action: RequestAction): void {
		if (!this.request || this.isActionBusy) {
			return;
		}

		if (this.form.invalid) {
			this.form.markAllAsTouched();
			return;
		}

		this.errorMessage = '';

		if (!this.validateSchedule()) {
			return;
		}

		const value = this.form.getRawValue();

		if (action.requiresRemarks && !value.remarks?.trim()) {
			this.errorMessage = 'Remarks wajib diisi untuk action ini.';
			this.form.controls.remarks.markAsTouched();
			return;
		}

		const startDate = this.formatDatabaseDateTime(value.startDate);

		const endDate = this.formatDatabaseDateTime(value.endDate);

		if (!startDate || !endDate) {
			this.errorMessage = 'Format tanggal dan waktu tidak valid.';
			return;
		}

		const payload = {
			actionCode: action.actionCode,
			startDate,
			endDate,
			remarks: value.remarks?.trim() || null,
		};

		if (this.isApproveAction(action)) {
			this.recheckAndExecute(payload);
			return;
		}

		this.executeAction(payload);
	}

	getAvailabilityLabel(
		status?: string | null,
		statusName?: string | null,
	): string {
		return statusName || status || 'Availability unknown';
	}

	formatInputDisplay(value?: string | null): string {
		const date = this.parseDateTimeLocal(value);

		if (!date) {
			return '';
		}

		const day = String(date.getDate()).padStart(2, '0');
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const year = date.getFullYear();
		const hour = String(date.getHours()).padStart(2, '0');
		const minute = String(date.getMinutes()).padStart(2, '0');

		return `${day}/${month}/${year} ${hour}:${minute}`;
	}

	openDatePicker(input: HTMLInputElement): void {
		if (typeof input.showPicker === 'function') {
			input.showPicker();
			return;
		}

		input.click();
	}

	private formatDatabaseDateTime(
		value: string | Date | null | undefined,
	): string | null {
		if (!value) {
			return null;
		}

		if (value instanceof Date) {
			if (Number.isNaN(value.getTime())) {
				return null;
			}

			return `${this.formatLocalDateTime(value).replace('T', ' ')}:00`;
		}

		const text = value.trim();

		if (!text) {
			return null;
		}

		const match = text.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);

		if (!match) {
			return null;
		}

		const [, year, month, day, hour, minute] = match;

		const date = new Date(
			Number(year),
			Number(month) - 1,
			Number(day),
			Number(hour),
			Number(minute),
			0,
			0,
		);

		if (
			date.getFullYear() !== Number(year) ||
			date.getMonth() + 1 !== Number(month) ||
			date.getDate() !== Number(day) ||
			date.getHours() !== Number(hour) ||
			date.getMinutes() !== Number(minute)
		) {
			return null;
		}

		return `${year}-${month}-${day} ${hour}:${minute}:00`;
	}
}
