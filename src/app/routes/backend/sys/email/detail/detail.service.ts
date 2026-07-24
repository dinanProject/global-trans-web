import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';

export interface EmailTransport {
	transportId: number;
	transportName: string;
}

export interface Email {
	emailId: number;
	emailGroup: number;
	emailName: number;
	emailCode: number;
	remark: number;
	transportId: number;
	subject: string;
	html: string;
}

@Injectable({
	providedIn: 'root'
})
export class DetailService {

	constructor(
		private apiService: ApiService
	) { }

	getEmail(emailId: number): Observable<Email> {
		return this.apiService.get(`/backend/sys/email/${emailId}`);
	}

	getEmailTransports(): Observable<EmailTransport[]> {
		return this.apiService.get(`/backend/sys/email/transport`);
	}

	insertEmail(data: any) {
		return this.apiService.post(`/backend/sys/email`, data);
	}

	updateEmail(emailId: number, data: any) {
		return this.apiService.put(`/backend/sys/email/${emailId}`, data);
	}
}
