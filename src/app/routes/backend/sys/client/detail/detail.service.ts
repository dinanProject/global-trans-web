import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';

export interface Client {
	clientId: number;
	clientCode: string;
	clientName: string;
	clientLogoPath: string;
	remark: string;
}

export interface Role {
	clientRoleId: number;
	isChecked: boolean;
	roleId: number;
	roleName: string;
	remark: string;
}

export interface Menu {
	clientMenuId: number;
	menuId: number;
	menuName: string;
	menuTypeId: number;
	parentId: number;
	icon: string;
	isChecked: boolean;
	isIndeterminate: boolean;
	level: number;
	child: Menu[];
}

export interface Config {
	configId: number;
	configCode: string;
	configName: string;
	configValue: any;
}

@Injectable({
	providedIn: 'root'
})
export class DetailService {

	constructor(
		private apiService: ApiService
	) { }

	getClient(clientId: number | string) {
		return this.apiService.get(`/backend/sys/client/${clientId}`);
	}

	insertClient(formData: FormData) {
		return this.apiService.upload(`/backend/sys/client`, formData);
	}

	updateClient(clientId: number, formData: FormData) {
		return this.apiService.upload(`/backend/sys/client/${clientId}`, formData, true);
	}
}
