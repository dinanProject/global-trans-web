import { Component, OnInit } from '@angular/core';
import { ChartColor, ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { Color, Label, SingleDataSet } from 'ng2-charts';
import { DashboardService } from './dashboard.service';
// import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import ChartDataLabels, { Context } from 'chartjs-plugin-datalabels';
import * as Chart from 'chart.js';


// export interface OpenCloseCount {
// 	isOpenCount: number;
// 	isClosedCount: number;
// 	totalCount: number;
// }

export interface UnitSalesStatus {
	availableCount: number;
	reservedCount: number;
	soldCount: number;
}

export interface UnitProgressStatus {
	indentCount: number;
	readyCount: number;
}

export interface IndentUnitSalesStatus {
	availableCount: number;
	reservedCount: number;
	soldCount: number;
}

export interface ReadyUnitSalesStatus {
	availableCount: number;
	reservedCount: number;
	soldCount: number;
}

export interface SalesAgentPropertyType {
	inhouseCount: number;
	propertyAgentCount: number;
	totalCount: number;
}

export interface SalesPropertyAgentLead {
	agentPropertyLeadName: string;
	totalCount: number;
}

export interface MonthlySalesUnit {
	salesYear: number;
	salesMonth: number;
	formattedSalesMonth: string;
	tunaiKerasCount: number;
	tunaiBertahapCount: number;
	kprCount: number;
	customCount: number;
	totalUnit: number;
}

export interface MonthlySalesAmount {
	salesMonth: number;
	formattedSalesMonth: string;
	totalAmount: number;
}

export interface MonthlySalesPaymentMethod {
	salesMonth: number;
	formattedSalesMonth: string;
	paymentMethodId: number;
	paymentMethodName: string;
	totalUnit: number;
}

export interface ListData {
	date: string;
	unitName: string;
	projectName: string;
	salesName: string;
	agentPropertyName: string;
}

export interface Summary {
	totalProject: number;
	totalUnit: number;
	totalSoldUnit: number;
	totalCanceledUnit: number;
	totalSoldAmount: number;
	// totalUnitOpenClosed: OpenCloseCount;
	totalUnitSalesStatus: UnitSalesStatus;
	totalUnitProgressStatus: UnitProgressStatus;
	totalIndentUnitSalesStatus: IndentUnitSalesStatus;
	totalReadyUnitSalesStatus: ReadyUnitSalesStatus;
	totalSalesAgentPropertyType: SalesAgentPropertyType;
	totalSalesPropertyAgentLead: SalesPropertyAgentLead[];
	monthlySalesUnit: MonthlySalesUnit[];
	monthlySalesAmount: MonthlySalesAmount[];
	recentSales: ListData[];
	recentReservation: ListData[];
	incomingAkad: ListData[];
}

@Component({
	selector: 'app-dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

	totalProject: number;
	totalUnit: number;

	totalSoldUnit: number;
	totalCanceledUnit: number;
	totalSoldAmount: string;
	// totalUnitOpenClosed: OpenCloseCount;
	totalUnitSalesStatus: UnitSalesStatus;
	totalUnitProgressStatus: UnitProgressStatus;
	totalIndentUnitSalesStatus: IndentUnitSalesStatus;
	totalReadyUnitSalesStatus: ReadyUnitSalesStatus;
	totalSalesAgentPropertyType: SalesAgentPropertyType;
	totalSalesPropertyAgentLead: SalesPropertyAgentLead[];

	monthlySalesUnit: MonthlySalesUnit[] = [];
	monthlySalesAmount: MonthlySalesAmount[] = [];
	monthlySalesPaymentMethod: MonthlySalesPaymentMethod[] = [];

	chartMonthlySalesAmountType: ChartType = 'bar';
	chartMonthlySalesAmountPlugins = [ChartDataLabels];

	chartMonthlySalesAmountOptions: ChartOptions = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			datalabels: {
				anchor: 'end',
				align: 'end',
				formatter: function (value) {
					const val = +value;
					if (val >= 1000000000) {
						const label = Math.round(val / 10000000) / 100;
						return 'Rp. ' + label + ' M';
					} else if (val < 1000000000 && val >= 1000000) {
						const label = Math.round(val / 1000000);
						return 'Rp. ' + label + ' Jt';
					} else if (val < 1000000 && val >= 1000) {
						return 'Rp. ' + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
					} else {
						return 'Rp. ' + value;
					}
				}
			}
		},
		scales: {
			yAxes: [
				{
					ticks: {
						autoSkip: false,
						fontFamily: 'Poppins',
						callback: (value) => {
							const val = +value;
							return 'Rp. ' + this.getAmount(val);
						}
					}
				}
			],
			xAxes: [
				{
					gridLines: {
						display: false
					},
					ticks: {
						fontFamily: 'Poppins',
					}
				}
			]
		}
	};

	chartMonthlySalesAmountColors: Color[] = [
		{
			backgroundColor: '#0085EB',
			borderColor: '#7d5be2',
			pointBackgroundColor: '#FFFFFF',
			pointBorderColor: '#7d5be2',
			pointHoverBackgroundColor: '#FFFFFF'
		},
		{
			backgroundColor: 'rgba(68, 145, 255, 0.1)',
			borderColor: '#4491ff',
			pointBackgroundColor: '#FFFFFF',
			pointBorderColor: '#4491ff',
			pointHoverBackgroundColor: '#FFFFFF'
		}
	];

	chartMonthlySalesAmountDataSets: ChartDataSets[];
	chartMonthlySalesAmountLabels: Label[] = [];

	chartMonthlySalesUnitType: ChartType = 'bar';
	chartMonthlySalesUnitYMax = 0;
	chartMonthlySalesUnitOptions: ChartOptions = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			datalabels: {
				anchor: 'center',
				align: 'center',
				color: '#ffffff',
				formatter: function (value, context) {
					const val = value;
					if (!val) {
						return '';
					}
					return val;
				}
			}
		},
		scales: {
			yAxes: [
				{
					stacked: true,
					ticks: {
						stepSize: 1,
						fontFamily: 'Poppins',
						min: 0,
					}
				}
			],
			xAxes: [
				{
					stacked: true,
					gridLines: {
						display: false
					},
					ticks: {
						fontFamily: 'Poppins',
					}
				}
			]
		},

		animation: {
			onComplete: function () {
				var chartInstance = this.chart;
				var ctx = chartInstance.ctx;
				ctx.textAlign = "center";
				ctx.fontFamily = 'Poppins';

				const datasets = this.data.datasets;
				const totals = [];
				datasets.forEach((dataset, i) => {
					dataset.data.forEach((data, j) => {
						totals[j] = (totals[j] || 0) + data;
					})
				});

				const meta = chartInstance.controller.getDatasetMeta(datasets.length - 1);
				meta.data.forEach((d, i) => {
					const posX = meta.data[i]._model.x;
					const posY = meta.data[i]._model.y;
					ctx.fillText(totals[i] + ' Unit', posX - 4, posY - 20);
				})
			}
		}
	};

	chartMonthlySalesUnitColors: Color[] = [
		{
			backgroundColor: '#40557D',
			borderColor: '#ffffff',
			pointBackgroundColor: '#FFFFFF',
			pointBorderColor: '#34aa44',
			pointHoverBackgroundColor: '#FFFFFF'
		},
		{
			backgroundColor: '#289DF5',
			borderColor: '#ffffff',
			pointBackgroundColor: '#FFFFFF',
			pointBorderColor: '#f16911',
			pointHoverBackgroundColor: '#FFFFFF'
		},
		{
			backgroundColor: '#FFD400',
			borderColor: '#ffffff',
			pointBackgroundColor: '#FFFFFF',
			pointBorderColor: '#ed1c24',
			pointHoverBackgroundColor: '#FFFFFF'
		}
	];

	chartMonthlySalesUnitDataSets: ChartDataSets[];
	chartMonthlySalesUnitLabels: Label[] = [];

	doughnutChartOptions: ChartOptions = {
		responsive: true,
		maintainAspectRatio: false,
		cutoutPercentage: 70,
		legend: {
			display: false
		}
	};

	chartSalesStatusData: SingleDataSet = [];
	chartSalesStatusLabels: Label[] = ['Available', 'Reserved', 'Sold'];
	chartSalesStatusType: ChartType = 'doughnut';
	chartSalesStatusColors = [
		{
			backgroundColor: [
				'#239111', '#2da1f8', '#f04047'
			]
		}
	];

	chartProgressStatusData: SingleDataSet = [];
	chartProgressStatusLabels: Label[] = ['Indent', 'Ready'];
	chartProgressStatusType: ChartType = 'doughnut';
	chartProgressStatusColors = [
		{
			backgroundColor: [
				'#289DF5', '#40557D'
			]
		}
	];

	chartIndentSalesStatusData: SingleDataSet = [];
	chartIndentSalesStatusLabels: Label[] = ['Available', 'Reserved', 'Sold'];
	chartIndentSalesStatusType: ChartType = 'doughnut';
	chartIndentSalesStatusColors = [
		{
			backgroundColor: [
				'#239111', '#2da1f8', '#f04047'
			]
		}
	];

	chartReadySalesStatusData: SingleDataSet = [];
	chartReadySalesStatusLabels: Label[] = ['Available', 'Reserved', 'Sold'];
	chartReadySalesStatusType: ChartType = 'doughnut';
	chartReadySalesStatusColors = [
		{
			backgroundColor: [
				'#239111', '#2da1f8', '#f04047'
			]
		}
	];

	chartSalesAgentPropertyTypeData: SingleDataSet = [];
	chartSalesAgentPropertyTypeLabels: Label[] = ['Inhouse', 'Property Agent'];
	chartSalesAgentPropertyTypeType: ChartType = 'doughnut';
	chartSalesAgentPropertyTypeColors = [
		{
			backgroundColor: [
				'#289DF5', '#40557D'
			]
		}
	];

	chartSalesPropertyAgentLeadData: SingleDataSet = [];
	chartSalesPropertyAgentLeadLabels: Label[] = [];
	chartSalesPropertyAgentLeadType: ChartType = 'doughnut';
	chartSalesPropertyAgentLeadColors = [
		{
			backgroundColor: [
				'#289DF5', '#40557D', '#FFD400', '#239111', '#2da1f8', '#f04047'
			]
		}
	];

	isInitialized: boolean;

	recentSales: ListData[];
	recentReservation: ListData[];
	incomingAkad: ListData[];

	constructor(
		private dashboardService: DashboardService
	) { }

	ngOnInit(): void {
		this.isInitialized = false;
		this.getSummary();
	}

	getAmount(val: number): string {
		if (val >= 1000000000) {
			const label = Math.round(val / 10000000) / 100;
			return label + ' M';
		} else if (val < 1000000000 && val >= 1000000) {
			const label = Math.round(val / 1000000);
			return label + ' Jt';
		} else if (val < 1000000 && val >= 1000) {
			return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
		} else {
			return val + '';
		}
	}

	getSummary() {
		this.dashboardService.getSummary().subscribe((summary: Summary) => {
			console.log('summary', summary);
			this.totalProject = summary.totalProject;
			this.totalUnit = summary.totalUnit;
			this.totalSoldUnit = summary.totalSoldUnit;
			this.totalCanceledUnit = summary.totalCanceledUnit;
			this.totalSoldAmount = this.getAmount(summary.totalSoldAmount);

			this.totalUnitSalesStatus = summary.totalUnitSalesStatus;
			this.totalUnitProgressStatus = summary.totalUnitProgressStatus;

			this.totalIndentUnitSalesStatus = summary.totalIndentUnitSalesStatus;
			this.totalReadyUnitSalesStatus = summary.totalReadyUnitSalesStatus;
			this.totalSalesAgentPropertyType = summary.totalSalesAgentPropertyType;

			this.monthlySalesUnit = summary.monthlySalesUnit;
			this.monthlySalesAmount = summary.monthlySalesAmount;

			this.recentSales = summary.recentSales;
			this.recentReservation = summary.recentReservation;
			this.incomingAkad = summary.incomingAkad;

			const monthlySalesAmountData = [];
			for (const row of summary.monthlySalesAmount) {
				monthlySalesAmountData.push(row.totalAmount);
				this.chartMonthlySalesAmountLabels.push(row.formattedSalesMonth);
			}

			this.chartMonthlySalesAmountDataSets = [
				{ data: monthlySalesAmountData, label: 'Total Sales Amount' }
			]

			const monthlySalesUnitDataTunaiKeras = [];
			const monthlySalesUnitDataTunaiBertahap = [];
			const monthlySalesUnitDataKPR = [];
			let max = 0;
			for (const row of summary.monthlySalesUnit) {
				max = Math.max(max, row.tunaiKerasCount + row.tunaiBertahapCount + row.kprCount);
				monthlySalesUnitDataTunaiKeras.push(row.tunaiKerasCount);
				monthlySalesUnitDataTunaiBertahap.push(row.tunaiBertahapCount);
				monthlySalesUnitDataKPR.push(row.kprCount);
				this.chartMonthlySalesUnitLabels.push(row.formattedSalesMonth);
			}

			this.chartMonthlySalesUnitOptions.scales.yAxes[0].ticks.max = max + 1;

			this.chartMonthlySalesUnitDataSets = [
				{ data: monthlySalesUnitDataTunaiKeras, label: 'Tunai Keras' },
				{ data: monthlySalesUnitDataTunaiBertahap, label: 'Tunai Bertahap' },
				{ data: monthlySalesUnitDataKPR, label: 'KPR' }
			]

			// this.chartTotalUnitData = [
			// 	summary.totalUnitOpenClosed.isOpenCount,
			// 	summary.totalUnitOpenClosed.isClosedCount
			// ]

			this.chartSalesStatusData = [
				summary.totalUnitSalesStatus.availableCount,
				summary.totalUnitSalesStatus.reservedCount,
				summary.totalUnitSalesStatus.soldCount,
			]

			this.chartProgressStatusData = [
				summary.totalUnitProgressStatus.indentCount,
				summary.totalUnitProgressStatus.readyCount
			]

			this.chartIndentSalesStatusData = [
				summary.totalIndentUnitSalesStatus.availableCount,
				summary.totalIndentUnitSalesStatus.reservedCount,
				summary.totalIndentUnitSalesStatus.soldCount
			]

			this.chartReadySalesStatusData = [
				summary.totalReadyUnitSalesStatus.availableCount,
				summary.totalReadyUnitSalesStatus.reservedCount,
				summary.totalReadyUnitSalesStatus.soldCount
			]

			this.chartSalesAgentPropertyTypeData = [
				summary.totalSalesAgentPropertyType.inhouseCount,
				summary.totalSalesAgentPropertyType.propertyAgentCount
			]

			// chartSalesPropertyAgentLeadData: SingleDataSet = [];
			// chartSalesPropertyAgentLeadLabels: Label[] = [];
			for (const row of summary.totalSalesPropertyAgentLead) {
				this.chartSalesPropertyAgentLeadData.push(row.totalCount);
				this.chartSalesPropertyAgentLeadLabels.push(row.agentPropertyLeadName);
			}

			this.isInitialized = true;
		})
	}

}
