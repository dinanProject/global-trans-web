import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';

@Injectable({
	providedIn: 'root'
})
export class LinkService {

	constructor(
		private apiService: ApiService
	) { }

	createLink(data: any) {
		return this.apiService.post(`/backend/sys/user-registration`, data)
	}
}
