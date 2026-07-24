import { Directive, TemplateRef, ViewContainerRef, Input } from '@angular/core';
import { SessionService } from '../services/session.service';

@Directive({
	// tslint:disable-next-line:directive-selector
	selector: '[ifHasMn]'
})
export class IfHasMnDirective {

	constructor(
		private sessionService: SessionService,
		private templateRef: TemplateRef<any>,
		private viewContainer: ViewContainerRef
	) { }

	@Input()
	set ifHasMn(mn: string | Array<string>) {
		this.viewContainer.clear();
		if (this.sessionService.hasMn(mn)) {
			this.viewContainer.createEmbeddedView(this.templateRef);
		}
	}
}
