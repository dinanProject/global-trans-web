import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from 'src/app/core/services/api.service';
import { LoginRequest, LoginResponse } from './login.model';

@Injectable({
	providedIn: 'root',
})
export class LoginService {
	constructor(private apiService: ApiService) {}

	login(payload: LoginRequest): Observable<LoginResponse> {
		return this.apiService.post('/auth/login', payload);
	}
}
