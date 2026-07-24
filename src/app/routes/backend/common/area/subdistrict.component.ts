import { Component, Input, OnInit } from '@angular/core';
import { AreaService, Subdistrict } from './area.service';

@Component({
	selector: 'subdistrict-tree',
	templateUrl: './subdistrict.component.html',
	styleUrls: ['./subdistrict.component.scss']
})
export class SubdistrictComponent implements OnInit {

	@Input() districtId: number;
	@Input() subdistrict: Subdistrict;

	constructor(
		private areaService: AreaService
	) { }

	ngOnInit(): void {
	}

}
