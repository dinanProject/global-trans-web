import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs';

import { UtilityService } from 'src/app/shared/utility/utility.service';
import {
	ReportCategoryOption,
	ReportCompanyOption,
	ReportDivisionOption,
	ReportExportFilter,
	ReportsService,
	ReportStatusOption,
} from './reports.service';

@Component({
	selector: 'app-equipment-request-reports',
	templateUrl: './reports.component.html',
	styleUrls: ['./reports.component.scss'],
	standalone: false,
})
export class ReportsComponent implements OnInit {
	loadingFilters = false;
	exporting = false;

	companies: ReportCompanyOption[] = [];
	divisions: ReportDivisionOption[] = [];
	categories: ReportCategoryOption[] = [];
	statuses: ReportStatusOption[] = [];

	filter: ReportExportFilter = this.emptyFilter();

	constructor(
		private readonly reportsService: ReportsService,
		private readonly utilityService: UtilityService,
	) {}

	ngOnInit(): void {
		this.loadFilters();
	}

	get filteredDivisions(): ReportDivisionOption[] {
		if (!this.filter.companyUuid) return this.divisions;
		return this.divisions.filter(
			(item) => item.companyUuid === this.filter.companyUuid,
		);
	}

	onCompanyChange(): void {
		if (
			this.filter.divisionUuid &&
			!this.filteredDivisions.some(
				(item) => item.uuid === this.filter.divisionUuid,
			)
		) {
			this.filter.divisionUuid = '';
		}
	}

	resetFilters(): void {
		this.filter = this.emptyFilter();
	}

	exportExcel(): void {
		if (this.exporting) return;
		if (
			this.filter.startDate &&
			this.filter.endDate &&
			this.filter.startDate > this.filter.endDate
		) {
			this.utilityService.alert(
				'Invalid Date Range',
				'Request Date To cannot be earlier than Request Date From.',
				'warning',
			);
			return;
		}

		this.exporting = true;
		this.reportsService
			.exportExcel(this.filter)
			.pipe(finalize(() => (this.exporting = false)))
			.subscribe({
				next: (blob) => this.downloadBlob(blob),
				error: () =>
					this.utilityService.alert(
						'Export Failed',
						'Equipment Request report could not be generated.',
						'error',
					),
			});
	}

	private loadFilters(): void {
		this.loadingFilters = true;
		this.reportsService
			.getFilters()
			.pipe(finalize(() => (this.loadingFilters = false)))
			.subscribe({
				next: (result) => {
					this.companies = result.companies ?? [];
					this.divisions = result.divisions ?? [];
					this.categories = result.categories ?? [];
					this.statuses = result.statuses ?? [];
				},
				error: () =>
					this.utilityService.alert(
						'Failed',
						'Report filters could not be loaded.',
						'error',
					),
			});
	}

	private downloadBlob(blob: Blob): void {
		const objectUrl = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = objectUrl;
		link.download = `equipment-request-report-${this.fileTimestamp()}.xlsx`;
		document.body.appendChild(link);
		link.click();
		link.remove();
		URL.revokeObjectURL(objectUrl);
	}

	private fileTimestamp(): string {
		const now = new Date();
		const pad = (value: number) => String(value).padStart(2, '0');
		return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
	}

	private emptyFilter(): ReportExportFilter {
		return {
			startDate: '',
			endDate: '',
			companyUuid: '',
			divisionUuid: '',
			status: '',
			categoryUuid: '',
		};
	}
}
