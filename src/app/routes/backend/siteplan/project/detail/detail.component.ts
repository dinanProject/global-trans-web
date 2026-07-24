import { formatDate } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Project } from '../project';
import { DetailService } from './detail.service';

@Component({
	selector: 'app-detail',
	templateUrl: './detail.component.html',
	styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {

	formGroup: UntypedFormGroup;
	projectName: UntypedFormControl;
	city: UntypedFormControl;
	remark: UntypedFormControl;
	projectTypeId: UntypedFormControl;
	companyId: UntypedFormControl;
	launchingDate: UntypedFormControl;

	siteplanPath: any;

	companies: Array<any> = [];
	projectTypes: Array<any> = [];

	projectId: number;
	title = 'Add Project';

	formSubmitAttempt: boolean;

	isSiteplanUpload: boolean;

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: any,
		private dialogRef: MatDialogRef<DetailComponent>,
		private detailService: DetailService,
		private formBuilder: UntypedFormBuilder
	) { }

	ngOnInit(): void {
		this.formSubmitAttempt = false;
		this.projectId = this.data.projectId;
		if (this.projectId) {
			this.title = 'Edit Project';
		}
		this.initForm()
			.then(() => this.getProject());
	}

	initForm() {
		return new Promise<void>((resolve, reject) => {
			this.projectName = new UntypedFormControl('', [Validators.required]);
			this.city = new UntypedFormControl('', [Validators.required]);
			this.remark = new UntypedFormControl('');
			this.projectTypeId = new UntypedFormControl(1, [Validators.required]);
			this.companyId = new UntypedFormControl(1, [Validators.required]);
			this.launchingDate = new UntypedFormControl('', [Validators.required]);
			this.formGroup = this.formBuilder.group({
				projectName: this.projectName,
				city: this.city,
				remark: this.remark,
				projectTypeId: this.projectTypeId,
				companyId: this.companyId,
				launchingDate: this.launchingDate
			});
			resolve();
		});
	}

	getProject() {
		return new Promise<void>((resolve, reject) => {
			if (!this.projectId) {
				return resolve();
			}
			this.detailService.getProject(this.projectId).subscribe(result => {
				console.log('getProject result', result);
				const project: Project = result.project;
				this.projectTypes = result.projectTypes;
				this.companies = result.companies;
				this.formGroup.setValue({
					projectName: project.projectName,
					city: project.city,
					remark: project.remark,
					projectTypeId: project.projectTypeId,
					companyId: project.companyId,
					launchingDate: project.launchingDate
				})
				this.siteplanPath = project.siteplanPath;
				resolve();
			});
		});
	}

	uploadSiteplanChanged(e) {
		const file: File = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];
		if (file) {
			this.convertImageToBase64(file)
				.then((base64Image) => {
					this.isSiteplanUpload = true;
					this.siteplanPath = base64Image;
					e.target.value = '';
				});
		}
	}

	convertImageToBase64(file) {
		console.log(file);
		return new Promise((resolve) => {
			const fileReader: FileReader = new FileReader();
			fileReader.onloadend = () => {
				resolve(fileReader.result.toString());
			};
			fileReader.onerror = (e) => console.error(e);
			fileReader.readAsDataURL(file);
		});
	}

	submit() {
		this.formSubmitAttempt = true;
		if (this.formGroup.invalid) {
			return;
		}

		const data = this.formGroup.value;
		data.launchingDate = formatDate(data.launchingDate, 'yyyy-MM-dd', 'en');
		if (this.isSiteplanUpload) {
			data.siteplanPath = this.siteplanPath;
		}

		if (this.projectId) {
			this.detailService.updateProject(this.projectId, data).subscribe(() => {
				this.dialogRef.close(true);
			})
		} else {
			this.detailService.insertProject(data).subscribe(() => {
				this.dialogRef.close(true);
			})
		}
	}

}
