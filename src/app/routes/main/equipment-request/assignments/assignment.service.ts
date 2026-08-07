import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from 'src/app/core/services/api.service';
import { RequestMaster } from '../request/request.service';

export interface EquipmentAssignment {
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

export interface AssignmentPayload {
	requestDetailUuid: string;
	equipmentUnitUuid: string;
	plannedStartDate: string;
	plannedEndDate: string;
	notes?: string | null;
}

export interface AssignmentWorkspace {
	request: RequestMaster;
	assignments: EquipmentAssignment[];
}

@Injectable({ providedIn: 'root' })
export class AssignmentService {
	private readonly baseUrl = '/equipment-request/assignment';

	constructor(private readonly apiService: ApiService) {}

	getAssignments(requestUuid: string): Observable<EquipmentAssignment[]> {
		return this.apiService.get(`${this.baseUrl}/${requestUuid}`);
	}

	getWorkspace(requestUuid: string): Observable<AssignmentWorkspace> {
		return this.apiService.get(`${this.baseUrl}/${requestUuid}/workspace`);
	}

	createAssignment(
		requestUuid: string,
		payload: AssignmentPayload,
	): Observable<EquipmentAssignment> {
		return this.apiService.post(`${this.baseUrl}/${requestUuid}`, payload);
	}

	createAssignments(
		requestUuid: string,
		assignments: AssignmentPayload[],
	): Observable<EquipmentAssignment[]> {
		return this.apiService.post(`${this.baseUrl}/${requestUuid}/bulk`, {
			assignments,
		});
	}

	startOperation(
		requestUuid: string,
		assignmentUuid: string,
	): Observable<EquipmentAssignment> {
		return this.apiService.post(
			`${this.baseUrl}/${requestUuid}/${assignmentUuid}/start`,
			{},
		);
	}

	startOperations(
		requestUuid: string,
		assignmentUuids: string[],
	): Observable<EquipmentAssignment[]> {
		return this.apiService.post(
			`${this.baseUrl}/${requestUuid}/start-all`,
			{ assignmentUuids },
		);
	}

	completeAssignment(
		requestUuid: string,
		assignmentUuid: string,
	): Observable<EquipmentAssignment> {
		return this.apiService.post(
			`${this.baseUrl}/${requestUuid}/${assignmentUuid}/complete`,
			{},
		);
	}
}
