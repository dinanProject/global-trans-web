import { Component, OnInit } from '@angular/core';
import { BackendService } from '../../../backend.service';
import { SalesService } from './sales.service';

export interface Year {
	year: number;
	months: Month[];
}

export interface Month {
	monthId: number;
	monthName: string;
}

export interface SalesMonth {
	monthName: string;
	totalUnit: number;
	totalAmount: number;
	salesList: Sales[];
}

export interface Sales {
	fullName: string;
	salesDate: string;
	unitName: string;
	salesPrice: number;
	paymentPlanName: string;
	salesName: string;
	agentPropertyName: string;
	agentPropertyLeadName: string;
	statusName: string;
	productReferenceName: string;
}

@Component({
	selector: 'app-sales',
	templateUrl: './sales.component.html',
	styleUrls: ['./sales.component.scss']
})
export class SalesComponent implements OnInit {

	isPeriodeInitialized: boolean;
	years: Year[];
	selectedYear: Year;
	months: Month[];
	selectedMonth: Month;
	monthId: number;

	salesMonths: SalesMonth[];

	constructor(
		private salesService: SalesService,
		private backendService: BackendService
	) { }

	ngOnInit(): void {
		this.backendService.hideSidebar()
			.then(() => this.getPeriode())
			.then(() => this.getSales());
	}

	getPeriode() {
		return new Promise<void>((resolve, reject) => {
			this.salesService.getPeriode().subscribe((years: Year[]) => {
				console.log('result', years);
				this.years = years;
				this.selectedYear = this.years[0];
				this.months = this.selectedYear.months;
				this.monthId = 0;
				this.isPeriodeInitialized = true;
				resolve();
			})
		});
	}

	getSales() {
		return new Promise<void>((resolve, reject) => {
			this.salesService.getSales(this.selectedYear.year, +this.monthId === 0 ? null : this.monthId).subscribe((salesMonths: SalesMonth[]) => {
				console.log('get sales result', salesMonths);
				this.salesMonths = salesMonths;
				resolve();
			})
		});
	}

	monthChanged(monthId: number) {
		this.monthId = monthId;
		this.getSales();
	}
}
