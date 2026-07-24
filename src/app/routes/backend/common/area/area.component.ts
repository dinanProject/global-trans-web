import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { AreaService, Province } from './area.service';

@Component({
	selector: 'app-area',
	templateUrl: './area.component.html',
	styleUrls: ['./area.component.scss']
})
export class AreaComponent implements OnInit {

	provinces: Province[] = [];
	isInitialized: boolean;

	constructor(
		private areaService: AreaService
	) { }

	ngOnInit(): void {
		this.isInitialized = false;
		this.getProvinces();
	}

	getProvinces() {
		return this.areaService.getProvinces()
			.toPromise()
			.then((provinces: Province[]) => {
				console.log('provinces', provinces);
				this.provinces = provinces;
				this.isInitialized = true;
			});
	}

	searchChanged(value: string) {

	}
}
