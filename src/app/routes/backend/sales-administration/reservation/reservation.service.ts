import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';

export interface Reservation {
	reservationId: number;
	reservationDate: string;
	reservationStatusId: number;
	reservationStatusName: string;
	fullName: string;
	projectName: string;
	unitName: string;
	salesName: string;
	organizationName: string;
}

@Injectable({
	providedIn: 'root'
})
export class ReservationService {

	constructor(
		private apiService: ApiService
	) { }

	getReservations(): Observable<Reservation[]> {
		return this.apiService.get(`/backend/sales-administration/reservation`);
	}
}
