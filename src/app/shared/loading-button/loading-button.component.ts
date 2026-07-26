import { Component, Input } from '@angular/core';

@Component({
	selector: 'loading-button',
	templateUrl: './loading-button.component.html',
	styleUrls: ['./loading-button.component.scss'],
	standalone: false,
})
export class LoadingButtonComponent {
	@Input() isLoading = false;
	@Input() disabled = false;
	@Input() loadingText = 'Loading...';
	@Input() type: 'button' | 'submit' | 'reset' = 'button';
	@Input() className = 'btn btn-primary';
}
