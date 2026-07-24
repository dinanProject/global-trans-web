import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionService } from 'src/app/services/session.service';

@Component({
	selector: 'app-logout',
	template: ''
})
export class LogoutComponent implements OnInit {

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private sessionService: SessionService,
		private location: Location
	) { }

	ngOnInit(): void {
		const returnUrl = this.route.snapshot.queryParams.returnUrl || '';
		this.sessionService.clear();
		this.location.replaceState('/');
		this.router.navigateByUrl(returnUrl);
	}

}
