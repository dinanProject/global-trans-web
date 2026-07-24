import { formatDate } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { formatWithOptions } from 'util';
import { Unit } from '../../unit/unit';
import { UnitComponent } from '../../unit/unit.component';
import { DetailService } from './detail.service';

@Component({
	selector: 'app-detail',
	templateUrl: './detail.component.html',
	styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {

	unit: Unit;

	formGroup: UntypedFormGroup;

	fullName: UntypedFormControl;
	agentName: UntypedFormControl;
	leadAgentName: UntypedFormControl;
	salesDate: UntypedFormControl;
	paymentMethodId: UntypedFormControl;
	salesPrice: UntypedFormControl;
	remark: UntypedFormControl;

	paymentMethods: Array<any> = [];
	formSubmitAttempt: boolean;

	constructor(
		@Inject(MAT_DIALOG_DATA) private data: any,
		private dialogRef: MatDialogRef<DetailComponent>,
		private formBuilder: UntypedFormBuilder,
		private detailService: DetailService
	) { }

	ngOnInit(): void {
		this.formSubmitAttempt = false;
		const unitId = this.data.unitId;
		const projectId = this.data.projectId;
		this.initForm();
		this.getUnit(projectId, unitId);
		console.log('this unit', this.unit);
	}

	initForm() {
		this.fullName = new UntypedFormControl('', [Validators.required]);
		this.agentName = new UntypedFormControl('', [Validators.required]);
		this.leadAgentName = new UntypedFormControl('', [Validators.required]);
		this.salesDate = new UntypedFormControl(new Date(), [Validators.required]);
		this.paymentMethodId = new UntypedFormControl(1, [Validators.required]);
		this.salesPrice = new UntypedFormControl('', [Validators.required]);
		this.remark = new UntypedFormControl('');
		this.formGroup = this.formBuilder.group({
			fullName: this.fullName,
			agentName: this.agentName,
			leadAgentName: this.leadAgentName,
			salesDate: this.salesDate,
			paymentMethodId: this.paymentMethodId,
			salesPrice: this.salesPrice,
			remark: this.remark
		});
	}

	getUnit(projectId: number, unitId: number) {
		this.detailService.getUnit(projectId, unitId).subscribe((data: { unit: Unit, paymentMethods: Array<any> }) => {
			console.log('data', data);
			this.unit = data.unit;
			this.paymentMethods = data.paymentMethods;
			this.formGroup.setValue({
				fullName: this.unit.fullName,
				agentName: this.unit.agentName,
				leadAgentName: this.unit.leadAgentName,
				salesDate: this.unit.salesDate || new Date(),
				paymentMethodId: this.unit.paymentMethodId || 1,
				salesPrice: this.unit.salesPrice || this.unit.tunaiKeras,
				remark: this.unit.remark
			})

			this.paymentMethodId.setValue(1);
		})
	}

	paymentMethodChanged(paymentMethodId: number) {
		console.log('paymentMethodId', paymentMethodId);
		if (+paymentMethodId === 1) {
			this.salesPrice.setValue(this.unit.tunaiKeras);
		} else if (+paymentMethodId === 2) {
			this.salesPrice.setValue(this.unit.tunaiBertahap);
		} else {
			this.salesPrice.setValue(this.unit.kpr);
		}
	}

	submit() {
		this.formSubmitAttempt = true;
		if (this.formGroup.invalid) {
			return;
		}

		const data = this.formGroup.value;
		data.salesDate = formatDate(data.salesDate, 'yyyy-MM-dd', 'en');
		this.detailService.save(this.unit.projectId, this.unit.unitId, data).subscribe(() => {
			this.dialogRef.close(true);
		});
	}

}
