import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from 'src/app/services/api.service';
import { Reservation } from './reservation.component';

@Injectable({
	providedIn: 'root'
})
export class ReservationService {

	constructor(
		private apiService: ApiService
	) { }

	getReservations(): Observable<Array<Reservation>> {
		return this.apiService.get(`/backend/property-management/reservation`);
	}

	printSpr(reservationId: number) {
		return this.apiService.post(`/backend/property-management/reservation/${reservationId}/print-spr`);
	}
}
