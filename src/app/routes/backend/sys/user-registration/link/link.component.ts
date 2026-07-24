import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LinkService } from './link.service';

@Component({
	selector: 'app-link',
	templateUrl: './link.component.html',
	styleUrls: ['./link.component.scss']
})
export class LinkComponent implements OnInit {

	isInitialized: boolean;

	clientSuffix: string;
	formGroup: UntypedFormGroup;
	linkName: UntypedFormControl;

	formSubmitAttempt: boolean;
	mode: 'create' | 'view' = 'create';

	link: string;

	constructor(
		@Inject(MAT_DIALOG_DATA) private data: { mode: 'create' | 'view', link: string },
		private linkService: LinkService,
		private formBuilder: UntypedFormBuilder
	) { }

	ngOnInit(): void {
		this.mode = this.data.mode;
		if (this.mode === 'create') {
			this.formSubmitAttempt = false;
			this.linkName = new UntypedFormControl('', [Validators.required]);
			this.formGroup = this.formBuilder.group({
				linkName: this.linkName
			});
		} else {
			this.link = this.data.link;
		}
	}

	get appUrl() {
		return window.location.protocol + '://' + window.location.host;
	}

	submit() {
		this.formSubmitAttempt = true;
		if (this.formGroup.invalid) {
			return;
		}

		const data = this.formGroup.value;
		this.linkService.createLink(data).subscribe(result => {
			// this.dialogRef.close(true);
			console.log('result', result);
			this.link = this.appUrl + '/user-registration?token=' + result;
			this.mode = 'view';
		})
	}
}
