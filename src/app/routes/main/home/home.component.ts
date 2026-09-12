import { Component, OnDestroy, OnInit } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { Subscription } from 'rxjs';

import {
	Lookup,
	LookupService,
} from 'src/app/shared/sys-lookup/lookup.service';

import {
	DashboardConfig,
	DashboardOverview,
	HomeService,
} from './home.service';

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
	showDashboardCharts = false;

	private readonly chartColors = {
		blue: '#5B7DBE',
		blueSoft: 'rgba(91, 125, 190, 0.12)',

		green: '#4F9A82',
		greenSoft: 'rgba(79, 154, 130, 0.12)',

		amber: '#D5A24A',
		amberSoft: 'rgba(213, 162, 74, 0.12)',

		orange: '#D58A5C',
		red: '#C97A7A',
		redDark: '#B96870',

		text: '#667085',
		grid: 'rgba(148, 163, 184, 0.14)',
		white: '#FFFFFF',
	};

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
				borderColor: this.chartColors.amber,
				backgroundColor: this.chartColors.amberSoft,
				tension: 0.35,
				pointRadius: 3,
				pointHoverRadius: 5,
				pointBackgroundColor: this.chartColors.white,
				pointBorderWidth: 2,
				fill: false,
			},
			{
				label: 'Started',
				data: [],
				borderColor: this.chartColors.blue,
				backgroundColor: this.chartColors.blueSoft,
				tension: 0.35,
				pointRadius: 3,
				pointHoverRadius: 5,
				pointBackgroundColor: this.chartColors.white,
				pointBorderWidth: 2,
				fill: false,
			},
			{
				label: 'Completed',
				data: [],
				borderColor: this.chartColors.green,
				backgroundColor: this.chartColors.greenSoft,
				tension: 0.35,
				pointRadius: 3,
				pointHoverRadius: 5,
				pointBackgroundColor: this.chartColors.white,
				pointBorderWidth: 2,
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
					color: this.chartColors.text,
					font: {
						size: 11,
						weight: 500,
					},
				},
			},
			tooltip: {
				padding: 12,
				titleColor: '#344054',
				bodyColor: '#667085',
				backgroundColor: 'rgba(255, 255, 255, 0.96)',
				borderColor: '#E4E7EC',
				borderWidth: 1,
				displayColors: true,
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
				ticks: {
					color: this.chartColors.text,
					font: {
						size: 11,
					},
				},
			},
			y: {
				beginAtZero: true,
				ticks: {
					precision: 0,
					color: this.chartColors.text,
					font: {
						size: 11,
					},
				},
				grid: {
					color: this.chartColors.grid,
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
				backgroundColor: [
					this.chartColors.green,
					this.chartColors.amber,
					this.chartColors.blue,
				],
				borderColor: this.chartColors.white,
				borderWidth: 3,
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
				backgroundColor: [
					this.chartColors.green,
					this.chartColors.orange,
					this.chartColors.red,
					this.chartColors.redDark,
				],
				borderRadius: 7,
				borderSkipped: false,
				barThickness: 28,
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
				backgroundColor: this.chartColors.blue,
				hoverBackgroundColor: '#4E70B2',
				borderRadius: 7,
				borderSkipped: false,
				barThickness: 28,
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
				backgroundColor: this.chartColors.green,
				hoverBackgroundColor: '#438A74',
				borderRadius: 7,
				borderSkipped: false,
				barThickness: 28,
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
		this.loadDashboardConfig();
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

	private loadDashboardConfig(): void {
		const subscription = this.homeService.getConfig().subscribe({
			next: (config: DashboardConfig) => {
				this.showDashboardCharts = config.showDashboardCharts === true;

				if (this.showDashboardCharts) {
					this.loadPeriodOptions();
				}
			},
			error: (error: unknown) => {
				console.error('Failed to load dashboard config', error);
				this.showDashboardCharts = false;
			},
		});

		this.subscriptions.add(subscription);
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
					borderColor: this.chartColors.amber,
					backgroundColor: this.chartColors.amberSoft,
					tension: 0.35,
					pointRadius: 3,
					pointHoverRadius: 5,
					pointBackgroundColor: this.chartColors.white,
					pointBorderWidth: 2,
					fill: false,
				},
				{
					label: 'Started',
					data: trend.map((item) => Number(item.started || 0)),
					borderColor: this.chartColors.blue,
					backgroundColor: this.chartColors.blueSoft,
					tension: 0.35,
					pointRadius: 3,
					pointHoverRadius: 5,
					pointBackgroundColor: this.chartColors.white,
					pointBorderWidth: 2,
					fill: false,
				},
				{
					label: 'Completed',
					data: trend.map((item) => Number(item.completed || 0)),
					borderColor: this.chartColors.green,
					backgroundColor: this.chartColors.greenSoft,
					tension: 0.35,
					pointRadius: 3,
					pointHoverRadius: 5,
					pointBackgroundColor: this.chartColors.white,
					pointBorderWidth: 2,
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
					backgroundColor: [
						this.chartColors.green,
						this.chartColors.amber,
						this.chartColors.blue,
					],
					borderColor: this.chartColors.white,
					borderWidth: 3,
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
						this.chartColors.green,
						this.chartColors.orange,
						this.chartColors.red,
						this.chartColors.redDark,
					],
					borderRadius: 7,
					borderSkipped: false,
					barThickness: 28,
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
					backgroundColor: this.chartColors.blue,
					hoverBackgroundColor: '#4E70B2',
					borderRadius: 7,
					borderSkipped: false,
					barThickness: 28,
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
					backgroundColor: this.chartColors.green,
					hoverBackgroundColor: '#438A74',
					borderRadius: 7,
					borderSkipped: false,
					barThickness: 28,
				},
			],
		};
	}
}
