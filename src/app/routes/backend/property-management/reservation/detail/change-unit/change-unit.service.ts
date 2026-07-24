import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

export interface Unit {
	unitId: number;
	unitName: string;
	lt: number;
	lb: number;
	unitTypeName: string;
	cashPrice: number;
}

@Injectable({
	providedIn: 'root'
})
export class ChangeUnitService {

	constructor(
		private apiService: ApiService
	) { }

	getUnits() {
		return this.apiService.get(`/backend/property-management/reservation/unit`);
	}
}
