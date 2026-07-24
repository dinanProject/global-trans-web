import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment as env } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { ApiResponse, ApiService } from 'src/app/services/api.service';

@Injectable({
	providedIn: 'root'
})
export class LoginService {

	constructor(
		private apiService: ApiService
	) { }

	login(username: string, password: string) {
		return this.apiService.post('/auth/login', {
			username,
			password
		});
	}
}
