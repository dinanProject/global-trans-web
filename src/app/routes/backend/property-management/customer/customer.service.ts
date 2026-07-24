import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

@Injectable({
	providedIn: 'root'
})
export class CustomerService {

	constructor(
		private aoiService: ApiService
	) { }
}
