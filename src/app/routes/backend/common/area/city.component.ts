import { Component, Input, OnInit } from '@angular/core';
import { AreaService, City, District } from './area.service';

@Component({
	selector: 'city-tree',
	templateUrl: './city.component.html',
	styleUrls: ['./city.component.scss']
})
export class CityComponent implements OnInit {

	@Input() provinceId: number;
	@Input() city: City;

	constructor(
		private areaService: AreaService
	) { }

	ngOnInit(): void {
	}

	toggle() {
		if (this.city.expanded) {
			return this.city.expanded = false;
		}

		this.city.isLoading = true;
		if (!this.city.districts) {
			this.areaService.getDistricts(this.provinceId, this.city.cityId)
				.toPromise()
				.then((districts: District[]) => {
					this.city.districts = districts;
					this.city.expanded = true;
					this.city.isLoading = false;
				});
		} else {
			this.city.expanded = true;
			this.city.isLoading = false;
		}
	}
}
