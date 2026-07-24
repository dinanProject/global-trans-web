import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

@Injectable({
	providedIn: 'root'
})
export class ClientService {

	constructor(
		private apiService: ApiService
	) { }

	getClients() {
		return this.apiService.get(`/backend/sys/client`);
	}

	deleteClient(clientId: number) {
		return this.apiService.delete(`/backend/sys/client/${clientId}`);
	}
}
