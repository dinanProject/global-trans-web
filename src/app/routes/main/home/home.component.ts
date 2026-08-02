import { Component, OnDestroy, OnInit } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { Subscription } from 'rxjs';

import {
	Lookup,
	LookupService,
} from 'src/app/shared/sys-lookup/lookup.service';

import { DashboardOverview, HomeService } from './home.service';

interface PeriodOption {
	value: string;
	label: string;
}

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.scss'],
	standalone: false,
})
export class HomeComponent implements OnInit, OnDestroy {
	selectedPeriod = '12_MONTHS';

	periodOptions: PeriodOption[] = [];

	isLoading = false;
	isPeriodLoading = false;
	loadError = '';

	totalEquipmentUnits = 0;

	private readonly subscriptions = new Subscription();

	operationsTrendData: ChartData<'line'> = {
		labels: [],
		datasets: [
			{
				label: 'Assigned',
				data: [],
				borderColor: '#d99a19',
				backgroundColor: 'rgba(217, 154, 25, 0.08)',
				tension: 0.35,
				pointRadius: 3,
				pointHoverRadius: 5,
				fill: false,
			},
			{
				label: 'Started',
				data: [],
				borderColor: '#3568d4',
				backgroundColor: 'rgba(53, 104, 212, 0.08)',
				tension: 0.35,
				pointRadius: 3,
				pointHoverRadius: 5,
				fill: false,
			},
			{
				label: 'Completed',
				data: [],
				borderColor: '#32936f',
				backgroundColor: 'rgba(50, 147, 111, 0.08)',
				tension: 0.35,
				pointRadius: 3,
				pointHoverRadius: 5,
				fill: false,
			},
		],
	};

	readonly operationsTrendOptions: ChartOptions<'line'> = {
		responsive: true,
		maintainAspectRatio: false,
		interaction: {
			intersect: false,
			mode: 'index',
		},
		plugins: {
			legend: {
				position: 'top',
				align: 'end',
				labels: {
					usePointStyle: true,
					pointStyle: 'circle',
					boxWidth: 8,
					boxHeight: 8,
					padding: 18,
				},
			},
			tooltip: {
				padding: 12,
			},
		},
		scales: {
			x: {
				grid: {
					display: false,
				},
				border: {
					display: false,
				},
			},
			y: {
				beginAtZero: true,
				ticks: {
					precision: 0,
				},
				grid: {
					color: 'rgba(120, 130, 150, 0.12)',
				},
				border: {
					display: false,
				},
			},
		},
	};

	utilizationData: ChartData<'doughnut'> = {
		labels: ['Available', 'Waiting Start', 'In Operation'],
		datasets: [
			{
				data: [0, 0, 0],
				backgroundColor: ['#32936f', '#d99a19', '#3568d4'],
				borderWidth: 0,
				hoverOffset: 6,
			},
		],
	};

	readonly utilizationOptions: ChartOptions<'doughnut'> = {
		responsive: true,
		maintainAspectRatio: false,
		cutout: '68%',
		plugins: {
			legend: {
				position: 'bottom',
				labels: {
					usePointStyle: true,
					pointStyle: 'circle',
					padding: 18,
				},
			},
		},
	};

	slaData: ChartData<'bar'> = {
		labels: ['On Time', 'Late Start', 'Overdue', 'Completed Late'],
		datasets: [
			{
				label: 'Assignments',
				data: [0, 0, 0, 0],
				backgroundColor: ['#32936f', '#e27531', '#d84b55', '#b83541'],
				borderRadius: 6,
				borderSkipped: false,
			},
		],
	};

	readonly slaOptions: ChartOptions<'bar'> = {
		responsive: true,
		maintainAspectRatio: false,
		indexAxis: 'y',
		plugins: {
			legend: {
				display: false,
			},
		},
		scales: {
			x: {
				beginAtZero: true,
				ticks: {
					precision: 0,
				},
				grid: {
					color: 'rgba(120, 130, 150, 0.12)',
				},
				border: {
					display: false,
				},
			},
			y: {
				grid: {
					display: false,
				},
				border: {
					display: false,
				},
			},
		},
	};

	categoryData: ChartData<'bar'> = {
		labels: [],
		datasets: [
			{
				label: 'Assignments',
				data: [],
				backgroundColor: '#3568d4',
				borderRadius: 6,
				borderSkipped: false,
			},
		],
	};

	get selectedPeriodLabel(): string {
		return (
			this.periodOptions.find(
				(option) => option.value === this.selectedPeriod,
			)?.label ?? this.selectedPeriod
		);
	}

	readonly categoryOptions: ChartOptions<'bar'> = {
		responsive: true,
		maintainAspectRatio: false,
		indexAxis: 'y',
		plugins: {
			legend: {
				display: false,
			},
		},
		scales: {
			x: {
				beginAtZero: true,
				ticks: {
					precision: 0,
				},
				grid: {
					color: 'rgba(120, 130, 150, 0.12)',
				},
				border: {
					display: false,
				},
			},
			y: {
				grid: {
					display: false,
				},
				border: {
					display: false,
				},
			},
		},
	};

	companyOperationsData: ChartData<'bar'> = {
		labels: [],
		datasets: [
			{
				label: 'Operations',
				data: [],
				backgroundColor: '#32936f',
				borderRadius: 6,
				borderSkipped: false,
			},
		],
	};

	readonly companyOperationsOptions: ChartOptions<'bar'> = {
		responsive: true,
		maintainAspectRatio: false,
		indexAxis: 'y',
		plugins: {
			legend: {
				display: false,
			},
		},
		scales: {
			x: {
				beginAtZero: true,
				ticks: {
					precision: 0,
				},
				grid: {
					color: 'rgba(120, 130, 150, 0.12)',
				},
				border: {
					display: false,
				},
			},
			y: {
				grid: {
					display: false,
				},
				border: {
					display: false,
				},
			},
		},
	};

	constructor(
		private readonly homeService: HomeService,
		private readonly lookupService: LookupService,
	) {}

	ngOnInit(): void {
		this.loadPeriodOptions();
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}

	onPeriodChange(): void {
		if (!this.selectedPeriod) {
			return;
		}

		this.loadDashboard();
	}

	private loadPeriodOptions(): void {
		this.isPeriodLoading = true;
		this.loadError = '';

		const subscription = this.lookupService
			.getLookupsByGroup('dashboard_period')
			.subscribe({
				next: (lookups: Lookup[]) => {
					this.periodOptions = (lookups ?? [])
						.filter(
							(lookup) =>
								Boolean(lookup.lookupCode) &&
								Boolean(lookup.lookupValue),
						)
						.sort(
							(first, second) =>
								Number(first.lookupId) -
								Number(second.lookupId),
						)
						.map((lookup) => ({
							value: lookup.lookupCode,
							label: lookup.lookupValue,
						}));

					this.setDefaultPeriod();
					this.isPeriodLoading = false;

					this.loadDashboard();
				},
				error: (error: unknown) => {
					console.error(
						'Failed to load dashboard period lookup',
						error,
					);

					this.periodOptions = [];
					this.isPeriodLoading = false;
					this.loadError =
						'Dashboard period options could not be loaded.';

					/*
					 * selectedPeriod tetap menggunakan 12_MONTHS
					 * supaya dashboard masih dapat dimuat.
					 */
					this.loadDashboard();
				},
			});

		this.subscriptions.add(subscription);
	}

	private setDefaultPeriod(): void {
		if (this.periodOptions.length === 0) {
			return;
		}

		const selectedPeriodExists = this.periodOptions.some(
			(option) => option.value === this.selectedPeriod,
		);

		if (selectedPeriodExists) {
			return;
		}

		const defaultPeriod = this.periodOptions.find(
			(option) => option.value === '12_MONTHS',
		);

		this.selectedPeriod =
			defaultPeriod?.value ?? this.periodOptions[0].value;
	}

	private loadDashboard(): void {
		this.isLoading = true;
		this.loadError = '';

		const subscription = this.homeService
			.getOverview({
				period: this.selectedPeriod,
			})
			.subscribe({
				next: (dashboard: DashboardOverview) => {
					this.applyDashboardData(dashboard);
					this.isLoading = false;
				},
				error: (error: unknown) => {
					console.error('Failed to load dashboard data', error);

					this.loadError = 'Dashboard data could not be loaded.';
					this.isLoading = false;
				},
			});

		this.subscriptions.add(subscription);
	}

	private applyDashboardData(dashboard: DashboardOverview): void {
		const trend = dashboard.operationsTrend ?? [];

		this.operationsTrendData = {
			labels: trend.map((item) => item.label),
			datasets: [
				{
					label: 'Assigned',
					data: trend.map((item) => Number(item.assigned || 0)),
					borderColor: '#d99a19',
					backgroundColor: 'rgba(217, 154, 25, 0.08)',
					tension: 0.35,
					pointRadius: 3,
					pointHoverRadius: 5,
					fill: false,
				},
				{
					label: 'Started',
					data: trend.map((item) => Number(item.started || 0)),
					borderColor: '#3568d4',
					backgroundColor: 'rgba(53, 104, 212, 0.08)',
					tension: 0.35,
					pointRadius: 3,
					pointHoverRadius: 5,
					fill: false,
				},
				{
					label: 'Completed',
					data: trend.map((item) => Number(item.completed || 0)),
					borderColor: '#32936f',
					backgroundColor: 'rgba(50, 147, 111, 0.08)',
					tension: 0.35,
					pointRadius: 3,
					pointHoverRadius: 5,
					fill: false,
				},
			],
		};

		const utilization = dashboard.equipmentUtilization;

		this.totalEquipmentUnits = Number(utilization?.totalUnits || 0);

		this.utilizationData = {
			labels: ['Available', 'Waiting Start', 'In Operation'],
			datasets: [
				{
					data: [
						Number(utilization?.available || 0),
						Number(utilization?.waitingStart || 0),
						Number(utilization?.inOperation || 0),
					],
					backgroundColor: ['#32936f', '#d99a19', '#3568d4'],
					borderWidth: 0,
					hoverOffset: 6,
				},
			],
		};

		const sla = dashboard.slaPerformance;

		this.slaData = {
			labels: ['On Time', 'Late Start', 'Overdue', 'Completed Late'],
			datasets: [
				{
					label: 'Assignments',
					data: [
						Number(sla?.onTime || 0),
						Number(sla?.lateStart || 0),
						Number(sla?.overdue || 0),
						Number(sla?.completedLate || 0),
					],
					backgroundColor: [
						'#32936f',
						'#e27531',
						'#d84b55',
						'#b83541',
					],
					borderRadius: 6,
					borderSkipped: false,
				},
			],
		};

		const categories = dashboard.topEquipmentCategories ?? [];

		this.categoryData = {
			labels: categories.map(
				(item) => item.name || item.code || 'Uncategorized',
			),
			datasets: [
				{
					label: 'Assignments',
					data: categories.map((item) => Number(item.total || 0)),
					backgroundColor: '#3568d4',
					borderRadius: 6,
					borderSkipped: false,
				},
			],
		};

		const companies = dashboard.operationsByCompany ?? [];

		this.companyOperationsData = {
			labels: companies.map(
				(item) => item.name || item.code || 'Unknown Company',
			),
			datasets: [
				{
					label: 'Operations',
					data: companies.map((item) => Number(item.total || 0)),
					backgroundColor: '#32936f',
					borderRadius: 6,
					borderSkipped: false,
				},
			],
		};
	}
}
