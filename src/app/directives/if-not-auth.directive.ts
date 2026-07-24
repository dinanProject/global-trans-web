import { Directive, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { SessionService } from '../services/session.service';
@Directive({
	// tslint:disable-next-line:directive-selector
	selector: '[ifNotAuth]'
})
export class IfNotAuthDirective implements OnInit {

	constructor(
		private sessionService: SessionService,
		private templateRef: TemplateRef<any>,
		private viewContainer: ViewContainerRef
	) { }

	ngOnInit() {
		this.viewContainer.clear();
		if (!this.sessionService.isAuth()) {
			this.viewContainer.createEmbeddedView(this.templateRef);
		}
	}
}
