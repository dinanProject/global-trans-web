import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from 'src/app/core/services/api.service';

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

export interface ReplacementPayload {
	equipmentUnitUuid: string;
	replacementReason: string;
	notes?: string | null;
}

@Injectable({ providedIn: 'root' })
export class AssignmentService {
	private readonly baseUrl = '/equipment-request/assignment';

	constructor(private readonly apiService: ApiService) {}

	getAssignments(requestUuid: string): Observable<EquipmentAssignment[]> {
		return this.apiService.get(`${this.baseUrl}/${requestUuid}`);
	}

	createAssignment(
		requestUuid: string,
		payload: AssignmentPayload,
	): Observable<EquipmentAssignment> {
		return this.apiService.post(`${this.baseUrl}/${requestUuid}`, payload);
	}

	replaceAssignment(
		requestUuid: string,
		assignmentUuid: string,
		payload: ReplacementPayload,
	): Observable<EquipmentAssignment> {
		return this.apiService.post(
			`${this.baseUrl}/${requestUuid}/${assignmentUuid}/replace`,
			payload,
		);
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
