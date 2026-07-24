import { Component, Input, OnInit } from '@angular/core';
import { AreaService, District, Subdistrict } from './area.service';

@Component({
	selector: 'district-tree',
	templateUrl: './district.component.html',
	styleUrls: ['./district.component.scss']
})
export class DistrictComponent implements OnInit {

	@Input() provinceId: number;
	@Input() cityId: number;
	@Input() district: District;

	constructor(
		private areaService: AreaService
	) { }

	ngOnInit(): void {
	}

	toggle() {
		if (this.district.expanded) {
			return this.district.expanded = false;
		}

		this.district.isLoading = true;
		if (!this.district.subdistricts) {
			this.areaService.getSubdistricts(this.provinceId, this.cityId, this.district.districtId)
				.toPromise()
				.then((subdistricts: Subdistrict[]) => {
					console.log('subdistricts', subdistricts);
					this.district.subdistricts = subdistricts;
					this.district.expanded = true;
					this.district.isLoading = false;
				});
		} else {
			this.district.expanded = true;
			this.district.isLoading = false;
		}
	}

}
