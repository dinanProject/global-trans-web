import { Component, Input, OnInit } from '@angular/core';
import { AreaService, City, Province } from './area.service';

@Component({
	selector: 'province-tree',
	templateUrl: './province.component.html',
	styleUrls: ['./province.component.scss']
})
export class ProvinceComponent implements OnInit {

	@Input() province: Province;

	constructor(
		private areaService: AreaService
	) { }

	ngOnInit(): void {
	}

	toggle() {
		if (this.province.expanded) {
			return this.province.expanded = false;
		}

		this.province.isLoading = true;
		if (!this.province.cities) {
			this.areaService.getCities(this.province.provinceId)
				.toPromise()
				.then((cities: City[]) => {
					this.province.cities = cities;
					this.province.expanded = true;
					this.province.isLoading = false;
				});
		} else {
			this.province.expanded = true;
			this.province.isLoading = false;
		}
	}

}
