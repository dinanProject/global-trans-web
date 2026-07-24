import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DetailService, Email, EmailTransport } from './detail.service';
// import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import Editor from 'src/assets/js/ckeditor/ckeditor';


@Component({
	selector: 'app-detail',
	templateUrl: './detail.component.html',
	styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {

	// public editor = ClassicEditor;
	public editor = Editor;

	isInitialized: boolean = false;

	emailId: number;

	formGroup: FormGroup;
	emailGroup: FormControl<string>;
	emailName: FormControl<string>;
	emailCode: FormControl<string>;
	remark: FormControl<string>;
	transportId: FormControl<string>;
	subject: FormControl<string>;
	html: FormControl<string>;

	formSubmitAttempt: boolean = false;

	transports: EmailTransport[] = [];
	errorMessage: string;

	constructor(
		private activatedRoute: ActivatedRoute,
		private formBuilder: UntypedFormBuilder,
		private detailService: DetailService
	) { }

	ngOnInit(): void {
		const emailId = this.activatedRoute.snapshot.paramMap.get('emailId');
		if (emailId !== 'new') {
			this.emailId = +emailId;
		}

		this.emailGroup = new FormControl(null, [Validators.required]);
		this.emailName = new FormControl(null, [Validators.required]);
		this.emailCode = new FormControl(null, [Validators.required]);
		this.remark = new FormControl(null);
		this.transportId = new FormControl(null);
		this.subject = new FormControl(null);
		this.html = new FormControl(null);

		this.formGroup = this.formBuilder.group({
			emailGroup: this.emailGroup,
			emailName: this.emailName,
			emailCode: this.emailCode,
			remark: this.remark,
			transportId: this.transportId,
			subject: this.subject,
			html: this.html
		})

		if (this.emailId) {
			this.getEmailTransports()
				.then(() => this.getEmail())
				.then(() => this.isInitialized = true);
		} else {
			this.getEmailTransports()
				.then(() => this.isInitialized = true);
		}
	}

	getEmail() {
		return this.detailService.getEmail(this.emailId)
			.toPromise()
			.then((email: Email) => {
				this.formGroup.setValue({
					emailGroup: email.emailGroup,
					emailCode: email.emailCode,
					emailName: email.emailName,
					remark: email.remark,
					transportId: email.transportId,
					subject: email.subject,
					html: email.html
				})
			});
	}

	getEmailTransports() {
		return this.detailService.getEmailTransports()
			.toPromise()
			.then((transports: EmailTransport[]) => {
				this.transports = transports;
			})
	}

	submit() {
		this.formSubmitAttempt = true;

		if (this.formGroup.invalid) {
			this.errorMessage = 'Please fill in all the required field';
			return;
		}

		const data = this.formGroup.value;

		if (this.emailId) {
			this.detailService.updateEmail(this.emailId, data)
				.subscribe((result) => {
					this.ngOnInit();
				})
		} else {
			this.detailService.insertEmail(data)
				.subscribe((result) => {

				})
		}
	}
}
