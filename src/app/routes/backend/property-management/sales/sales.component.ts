import { Component, OnInit } from '@angular/core';
import { Month, Sales, SalesMonth, SalesService, Year } from './sales.service';

@Component({
	selector: 'app-sales',
	templateUrl: './sales.component.html',
	styleUrls: ['./sales.component.scss']
})
export class SalesComponent implements OnInit {

	isInitialized: boolean;
	isPeriodeInitialized: boolean;

	years: Year[];
	selectedYear: Year;
	months: Month[];
	filteredMonths: Month[];
	selectedMonth: Month;
	monthId: number;

	salesMonths: SalesMonth[];

	search = '';

	isNoData: boolean;

	constructor(
		private salesService: SalesService
	) { }

	ngOnInit(): void {
		this.isNoData = false;
		this.isPeriodeInitialized = false;
		this.isInitialized = false;
		this.getPeriode()
			.then(() => this.getSales());
	}

	get filteredSalesMonths() {
		const filteredSalesMonths = [];
		this.salesMonths.forEach((salesMonth: SalesMonth) => {
			const filteredSalesList = salesMonth.salesList.filter((sales: Sales) => {
				return this.search ? (
					sales.fullName?.toLowerCase().indexOf(this.search.toLowerCase()) > -1 ||
					sales.unitName?.toLowerCase().indexOf(this.search.toLowerCase()) > -1
				) : true;
			})

			if (filteredSalesList.length > 0) {
				const sm: SalesMonth = JSON.parse(JSON.stringify(salesMonth));
				sm.salesList = filteredSalesList;
				filteredSalesMonths.push(sm);
			}
		})

		return filteredSalesMonths;
	}

	yearChanged(year: number) {
		this.selectedYear = this.years.find((y: Year) => +y.year === +year);
		this.months = this.selectedYear.months;
		this.monthId = 0;
		this.getSales();
	}

	monthChanged(monthId: number) {
		this.monthId = monthId;
		this.getSales();
	}

	getPeriode() {
		return new Promise<void>((resolve, reject) => {
			this.salesService.getPeriode().subscribe((years: Year[]) => {
				console.log('result', years);
				if (years.length === 0) {
					console.log('no data');
					this.isPeriodeInitialized = true;
					this.isNoData = true;
					return resolve();
				}
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
			if (this.isNoData) {
				this.isInitialized = true;
				console.log('this.isInitialized = ', this.isInitialized);
				return resolve();
			}
			this.salesService.getSales(this.selectedYear.year, +this.monthId === 0 ? null : this.monthId).subscribe((salesMonths: SalesMonth[]) => {
				console.log('get sales result', salesMonths);
				this.salesMonths = salesMonths;
				this.isInitialized = true;
				resolve();
			})
		});
	}

	printSpr(sales: Sales) {
		sales.isSprPrinting = true;
		this.salesService.printSpr(sales.salesId).subscribe(result => {
			console.log(result);
			window.open(result);
			sales.isSprPrinting = false;
		})
	}

	exportToExcel() {
		this.salesService.exportToExcel().subscribe(result => {
			window.open(result);
		});
	}
}
