import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
	selector: 'app-registration-success',
	templateUrl: './registration-success.component.html',
	styleUrls: ['./registration-success.component.scss']
})
export class RegistrationSuccessComponent implements OnInit {

	constructor(
		private router: Router
	) { }

	ngOnInit(): void {
		setTimeout(() => {
			this.router.navigate(['auth/login']);
		}, 10000);
	}

}
