import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { Unit } from '../detail/detail.service';

@Injectable({
	providedIn: 'root'
})
export class UnitService {

	constructor(
		private apiService: ApiService
	) { }

	getUnits(): Observable<Unit[]> {
		return this.apiService.get(`/backend/sales-administration/reservation/unit`)
	}
}
