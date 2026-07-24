import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';

export interface Menu {
	menuId: number;
	menuCode: string;
	menuName: string;
	route: string;
	menuTypeId: number;
	menuTypeName: string;
	parentId: number;
	parentName: string;
	sequence: number;
	icon: string;
}

export interface MenuType {
	menuTypeId: number;
	menuTypeName: string;
}
@Injectable({
	providedIn: 'root'
})
export class DetailService {

	constructor(
		private apiService: ApiService
	) { }

	getMenu(menuId): Observable<Menu> {
		return this.apiService.get(`/backend/sys/menu-and-function/${menuId}`);
	}

	getMenuTypes(): Observable<MenuType[]> {
		return this.apiService.get(`/backend/sys/menu-and-function/menu-type`);
	}

	insertMenu(data) {
		return this.apiService.post(`/backend/sys/menu-and-function`, data);
	}

	updateMenu(menuId, data) {
		return this.apiService.put(`/backend/sys/menu-and-function/${menuId}`, data);
	}
}
