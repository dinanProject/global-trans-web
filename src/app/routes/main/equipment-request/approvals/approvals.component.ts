import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';

import {
	Subject,
	debounceTime,
	distinctUntilChanged,
	finalize,
	takeUntil,
} from 'rxjs';

import { UtilityService } from 'src/app/shared/utility/utility.service';
import { RequestAction, RequestMaster } from '../request/request.service';

import { ApprovalService } from './approvals.service';
import { Menu } from 'src/app/core/models/menu.model';
import { MainService } from '../../main.service';

@Component({
	selector: 'app-equipment-request-approvals',
	templateUrl: './approvals.component.html',
	styleUrls: ['./approvals.component.scss'],
	standalone: false,
})
export class ApprovalsComponent implements OnInit, OnDestroy {
	private readonly destroy$ = new Subject<void>();
	private approvalUnreadCount: number | null = null;
	private approvalUnreadReferences = new Set<string>();
	private pendingRefresh = false;

	private readonly approvalPermissionCodes = new Set([
		'EQUIPMENT_APPROVAL.CLIENT_APPROVE',
		'EQUIPMENT_APPROVAL.CLIENT_REJECT',
		'EQUIPMENT_APPROVAL.GTSI_APPROVE',
		'EQUIPMENT_APPROVAL.GTSI_REJECT',
	]);

	readonly searchControl = new FormControl('', { nonNullable: true });
	readonly stageControl = new FormControl('all', { nonNullable: true });
	readonly maxEquipmentPreview = 1;

	requests: RequestMaster[] = [];
	filteredRequests: RequestMaster[] = [];

	isLoading = false;

	errorMessage = '';

	constructor(
		private readonly approvalService: ApprovalService,
		private readonly utilityService: UtilityService,
		private readonly router: Router,
		private readonly mainService: MainService,
	) {}

	ngOnInit(): void {
		this.searchControl.valueChanges
			.pipe(
				debounceTime(250),
				distinctUntilChanged(),
				takeUntil(this.destroy$),
			)
			.subscribe(() => this.applyFilters());

		this.stageControl.valueChanges
			.pipe(takeUntil(this.destroy$))
			.subscribe(() => this.applyFilters());

		this.mainService.menus$
			.pipe(takeUntil(this.destroy$))
			.subscribe((menus) => this.handleMenuUnreadChange(menus ?? []));

		this.loadRequests();
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	loadRequests(): void {
		if (this.isLoading) {
			this.pendingRefresh = true;
			return;
		}

		this.isLoading = true;
		this.errorMessage = '';

		this.approvalService
			.getApprovals()
			.pipe(
				takeUntil(this.destroy$),
				finalize(() => {
					this.isLoading = false;

					if (this.pendingRefresh) {
						this.pendingRefresh = false;
						this.loadRequests();
					}
				}),
			)
			.subscribe({
				next: (response) => {
					this.requests = Array.isArray(response) ? response : [];
					this.applyFilters();
				},

				error: (error) => {
					this.errorMessage =
						error?.error?.message ||
						'Failed to load approval requests.';

					this.requests = [];
					this.applyFilters();
				},
			});
	}

	private handleMenuUnreadChange(menus: Menu[]): void {
		const approvalMenu = this.findMenuByRoute(
			menus,
			'/equipment-request/approvals',
		);
		this.approvalUnreadReferences = new Set(
			approvalMenu?.unreadReferenceUuids ?? [],
		);
		const unreadCount = Number(approvalMenu?.unreadCount ?? 0);

		if (this.approvalUnreadCount === null) {
			this.approvalUnreadCount = unreadCount;
			return;
		}

		const increased = unreadCount > this.approvalUnreadCount;
		this.approvalUnreadCount = unreadCount;

		if (increased) {
			this.loadRequests();
		}
	}

	private getUnreadCountByRoute(menus: Menu[], route: string): number {
		for (const menu of menus) {
			const normalizedRoute = this.normalizeRoute(menu.route);

			if (normalizedRoute === route) {
				return Number(menu.unreadCount ?? 0);
			}

			const childMatch = this.findMenuByRoute(menu.child ?? [], route);

			if (childMatch) {
				return Number(childMatch.unreadCount ?? 0);
			}
		}

		return 0;
	}

	private findMenuByRoute(menus: Menu[], route: string): Menu | null {
		for (const menu of menus) {
			if (this.normalizeRoute(menu.route) === route) {
				return menu;
			}

			const childMatch = this.findMenuByRoute(menu.child ?? [], route);

			if (childMatch) {
				return childMatch;
			}
		}

		return null;
	}

	private normalizeRoute(route: string | null | undefined): string | null {
		if (!route) {
			return null;
		}

		const normalized = route.trim().replace(/^\/main/, '');

		return normalized.startsWith('/') ? normalized : `/${normalized}`;
	}

	resetFilters(): void {
		this.searchControl.setValue('', { emitEvent: false });
		this.stageControl.setValue('all', { emitEvent: false });
		this.applyFilters();
	}

	getEquipmentPreview(details: any[] | null | undefined): any[] {
		return (details ?? []).slice(0, this.maxEquipmentPreview);
	}

	getRemainingEquipmentCount(request: RequestMaster): number {
		const detailCount = Number(
			request.detailCount ?? request.details?.length ?? 0,
		);

		return Math.max(detailCount - this.maxEquipmentPreview, 0);
	}

	approvalActions(request: RequestMaster): RequestAction[] {
		return (request.availableActions ?? [])
			.filter((action: RequestAction) =>
				this.approvalPermissionCodes.has(action.permissionCode ?? ''),
			)
			.sort(
				(a: RequestAction, b: RequestAction) =>
					Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0),
			);
	}

	approveActions(request: RequestMaster): RequestAction[] {
		return this.approvalActions(request).filter((action: RequestAction) =>
			this.isApproveAction(action),
		);
	}

	rejectActions(request: RequestMaster): RequestAction[] {
		return this.approvalActions(request).filter((action: RequestAction) =>
			this.isRejectAction(action),
		);
	}

	openReviewPage(request: RequestMaster): void {
		if (!this.canReview(request)) {
			return;
		}

		this.router.navigate([
			'/equipment-request/approvals',
			request.uuid,
			'review',
		]);
	}

	canReview(request: RequestMaster): boolean {
		return this.approvalActions(request).length > 0;
	}

	statusClass(status: string | null | undefined): string {
		return String(status || '')
			.toLowerCase()
			.replace(/_/g, '-');
	}

	stageLabel(request: RequestMaster): string {
		if (request.status === 'CLIENT_REVIEW') {
			return 'Client Approval';
		}

		if (request.status === 'GTSI_REVIEW') {
			return 'Global Trans Review';
		}

		return request.statusStage || request.statusName || request.status;
	}

	getStatusDisplayName(request: RequestMaster): string {
		return request.statusName || request.status;
	}

	trackByUuid(_: number, request: RequestMaster): string {
		return request.uuid;
	}

	isRequestUnread(requestUuid: string | null | undefined): boolean {
		return Boolean(
			requestUuid && this.approvalUnreadReferences.has(requestUuid),
		);
	}

	isApproveAction(action: RequestAction): boolean {
		return ['APPROVE_CLIENT', 'APPROVE_GTSI'].includes(action.actionCode);
	}

	isRejectAction(action: RequestAction): boolean {
		return ['REJECT_CLIENT', 'REJECT_GTSI'].includes(action.actionCode);
	}

	isClientApprovalAction(action: RequestAction): boolean {
		return ['APPROVE_CLIENT', 'REJECT_CLIENT'].includes(action.actionCode);
	}

	isGtsiAction(action: RequestAction): boolean {
		return ['APPROVE_GTSI', 'REJECT_GTSI'].includes(action.actionCode);
	}

	private applyFilters(): void {
		const keyword = this.searchControl.value.trim().toLowerCase();

		const stage = this.stageControl.value;

		this.filteredRequests = this.requests.filter(
			(request: RequestMaster) => {
				if (stage !== 'all' && this.getStageKey(request) !== stage) {
					return false;
				}

				if (!keyword) return true;

				return [
					request.requestNo,
					request.companyName,
					request.companyCode,
					request.divisionName,
					request.requestByName,
					request.purpose,
					request.statusName,
					request.status,
				]
					.filter(Boolean)
					.join(' ')
					.toLowerCase()
					.includes(keyword);
			},
		);
	}

	private getStageKey(request: RequestMaster): string {
		if (request.status === 'CLIENT_REVIEW') {
			return 'client';
		}

		if (request.status === 'GTSI_REVIEW') {
			return 'global-approval';
		}

		return 'other';
	}

	formatPeriodDateTime(value?: string | null): string {
		if (!value) {
			return '—';
		}

		const date = new Date(value);

		if (Number.isNaN(date.getTime())) {
			return value;
		}

		return new Intl.DateTimeFormat('id-ID', {
			day: '2-digit',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			hour12: false,
		}).format(date);
	}
}
