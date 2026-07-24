import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

@Injectable({
	providedIn: 'root'
})
export class MenuAndFunctionService {

	constructor(
		private apiService: ApiService
	) { }

	getMenusAndFunctions() {
		return this.apiService.get(`/backend/sys/menu-and-function/`)
	}

	deleteMenu(menuId) {
		return this.apiService.delete(`/backend/sys/menu-and-function/${menuId}`);
	}
}
