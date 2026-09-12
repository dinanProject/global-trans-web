import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from 'src/app/core/services/api.service';
import { RequestMaster } from '../request/request.service';

export interface EquipmentOperation {
	id?: number;
	uuid: string;
	requestDetailUuid: string;
	equipmentUnitUuid: string;
	statusCode: string;
	plannedStartDate?: string | null;
	plannedEndDate?: string | null;
	actualStartDate?: string | null;
	actualEndDate?: string | null;
	assignedByName?: string | null;
	assignedAt?: string | null;
	replacementReason?: string | null;
	notes?: string | null;
	isActive?: boolean;
}


export interface OperationWorkspace {
	request: RequestMaster;
	operations: EquipmentOperation[];
}

@Injectable({ providedIn: 'root' })
export class OperationsService {
	private readonly baseUrl = '/equipment-request/operations';

	constructor(private readonly apiService: ApiService) {}

	getWorkspace(requestUuid: string): Observable<OperationWorkspace> {
		return this.apiService.get(`${this.baseUrl}/${requestUuid}/workspace`);
	}

	completeOperation(
		requestUuid: string,
		operationUuid: string,
	): Observable<EquipmentOperation> {
		return this.apiService.post(
			`${this.baseUrl}/${requestUuid}/${operationUuid}/complete`,
			{},
		);
	}
}
