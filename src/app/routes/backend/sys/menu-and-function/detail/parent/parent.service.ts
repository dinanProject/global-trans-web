import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

@Injectable({
	providedIn: 'root'
})
export class ParentService {

	constructor(
		private apiService: ApiService
	) { }

	getMenus() {
		return this.apiService.get(`/backend/sys/menu-and-function/parent`);
	}
}
