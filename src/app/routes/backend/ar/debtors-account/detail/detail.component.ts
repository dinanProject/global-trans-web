import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DetailService, Sales } from './detail.service';

@Component({
	selector: 'app-detail',
	templateUrl: './detail.component.html',
	styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {

	salesId: number;
	sales: Sales;

	isInitialized: boolean;

	constructor(
		private activatedRoute: ActivatedRoute,
		private detailService: DetailService
	) { }

	ngOnInit(): void {
		this.isInitialized = false;
		this.salesId = +this.activatedRoute.snapshot.paramMap.get('salesId');
		this.getSales()
			.then(() => {
				this.isInitialized = true;
			})
	}

	getSales() {
		return this.detailService.getSales(this.salesId)
			.toPromise()
			.then((sales: Sales) => {
				console.log('sales', sales);
				this.sales = sales;
			})
	}

}
