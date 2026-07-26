import { Component, OnInit } from '@angular/core';
import { environment as env } from 'src/environments/environment';

@Component({
    selector: 'app-unauthorized',
    templateUrl: './unauthorized.component.html',
    styleUrls: ['./unauthorized.component.scss'],
    standalone: false
})
export class UnauthorizedComponent implements OnInit {

	apiUrl = env.apiUrl;
	constructor() { }

	ngOnInit() {
	}

}
