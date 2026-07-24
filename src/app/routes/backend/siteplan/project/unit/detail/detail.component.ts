import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DetailService } from './detail.service';

@Component({
	selector: 'app-detail',
	templateUrl: './detail.component.html',
	styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {

	projectId: number;
	unitId: number;

	progressStatuses: Array<any> = [];
	unitTypes: Array<any> = [];
	unitCategories: Array<any> = [];

	formGroup: UntypedFormGroup;
	blockName: UntypedFormControl;
	unitName: UntypedFormControl;
	unitCategoryId: UntypedFormControl;
	unitTypeId: UntypedFormControl;
	progressStatusId: UntypedFormControl;
	isShowUnit: UntypedFormControl;
	isOpen: UntypedFormControl;
	lt: UntypedFormControl;
	lb: UntypedFormControl;

	formSubmitAttempt: boolean;

	constructor(
		private formBuilder: UntypedFormBuilder,
		@Inject(MAT_DIALOG_DATA) private data: any,
		private detailService: DetailService
	) { }

	ngOnInit(): void {
		this.formSubmitAttempt = false;
		this.projectId = this.data.projectId;
		this.unitId = this.data.unitId;
		this.initForm();
		this.getUnits();
	}

	initForm() {
		this.blockName = new UntypedFormControl('', [Validators.required]);
		this.unitName = new UntypedFormControl('', [Validators.required]);
		this.unitCategoryId = new UntypedFormControl('', [Validators.required]);
		this.unitTypeId = new UntypedFormControl('', [Validators.required]);
		this.progressStatusId = new UntypedFormControl('', [Validators.required]);
		this.isShowUnit = new UntypedFormControl('', [Validators.required]);
		this.isOpen = new UntypedFormControl('', [Validators.required]);
		this.lt = new UntypedFormControl('', [Validators.required]);
		this.lb = new UntypedFormControl('', [Validators.required]);
		this.formGroup = this.formBuilder.group({
			blockName: this.blockName,
			unitName: this.unitName,
			unitCategoryId: this.unitCategoryId,
			unitTypeId: this.unitTypeId,
			progressStatusId: this.progressStatusId,
			isShowUnit: this.isShowUnit,
			isOpen: this.isOpen,
			lt: this.lt,
			lb: this.lb
		});
	}

	getUnits() {
		this.detailService.getUnits(this.projectId, this.unitId).subscribe(result => {
			console.log('result', result);
			this.progressStatuses = result.progressStatuses;
			this.unitCategories = result.unitCategories;
			this.unitTypes = result.unitTypes;
			this.formGroup.setValue({
				blockName: result.unit.blockName,
				unitName: result.unit.unitName,
				unitCategoryId: result.unit.unitCategoryId,
				unitTypeId: result.unit.unitTypeId,
				progressStatusId: result.unit.progressStatusId,
				isShowUnit: result.unit.isShowUnit,
				isOpen: result.unit.isOpen,
				lt: result.unit.lt,
				lb: result.unit.lb
			})
		})
	}

	submit() {
		this.formSubmitAttempt = true;
		if (this.formGroup.invalid) {
			return;
		}

		this.detailService.updateUnit(this.projectId, this.unitId, this.formGroup.value).subscribe(result => {
			console.log(result);
		})
	}
}
