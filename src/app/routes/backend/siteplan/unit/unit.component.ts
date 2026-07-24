import { Component, OnInit } from '@angular/core';
import { switchMap } from 'rxjs/operators';
import { Unit } from './unit';
import { UnitService } from './unit.service';

@Component({
	selector: 'app-unit',
	templateUrl: './unit.component.html',
	styleUrls: ['./unit.component.scss']
})
export class UnitComponent implements OnInit {

	constructor(
		private unitService: UnitService
	) { }

	ngOnInit(): void {
	}

	getCompanies() {
		this.unitService.getCompanies();
	}

	getProjects() {
		this.unitService.getProjects().subscribe(result => {

		})
	}

	getUnits(projectId: number) {
		this.unitService.getUnits(projectId).subscribe((units: Array<Unit>) => {
			console.log('units', units);
		})
	}

}
