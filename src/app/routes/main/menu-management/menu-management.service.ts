import { Injectable } from '@angular/core';

import { ApiService } from 'src/app/core/services/api.service';

export interface Menu {
	menuId: number;
	uuid: string;
	parentId: number | null;
	parentUuid?: string | null;
	parentMenuName?: string | null;
	code: string;
	menuName: string;
	route: string | null;
	icon: string | null;
	permissionId: number | null;
	permissionCode?: string | null;
	permissionLabel?: string | null;
	sequence: number;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
	child?: Menu[];
}

export interface MenuPayload {
	parentUuid: string | null;
	code: string;
	menuName: string;
	route: string | null;
	icon: string | null;
	permissionId: number | null;
	sequence: number;
	isActive: boolean;
}

export interface MenuDialogData {
	mode: 'create' | 'edit';
	menu?: Menu;
	parentMenu?: Menu;
	menus: Menu[];
}

export interface MenuDialogResult {
	action: 'save';
	payload: MenuPayload;
}

@Injectable()
export class MenuManagementService {
	constructor(private apiService: ApiService) {}

	getMenus() {
		return this.apiService.get('/menu');
	}

	getMenuTree() {
		return this.apiService.get('/menu/tree');
	}

	getMenu(uuid: string) {
		return this.apiService.get(`/menu/${uuid}`);
	}

	createMenu(payload: MenuPayload) {
		return this.apiService.post('/menu', payload);
	}

	updateMenu(uuid: string, payload: MenuPayload) {
		return this.apiService.put(`/menu/${uuid}`, payload);
	}

	deactivateMenu(uuid: string) {
		return this.apiService.delete(`/menu/${uuid}`);
	}
}
