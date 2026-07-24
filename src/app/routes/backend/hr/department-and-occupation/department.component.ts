import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DetailComponent, DialogAction, DialogData, DialogType } from './detail/detail.component';
import { Occupation } from './occupation.component';

export interface Department {
	companyId: number;
	departmentId: number;
	departmentName: string;
	departmentTypeId: number;
	parentId: number;
	parentName: string;
	sequence: number;
	remark: string;
	level: number;
	occupations: Occupation[];
	departments: Department[];
}

@Component({
	selector: 'department-tree',
	templateUrl: './department.component.html',
	styleUrls: ['./department.component.scss']
})
export class DepartmentComponent implements OnInit {

	@Input() department: Department;

	@Output() departmentAdded: EventEmitter<{ companyId: number, departmentId: number, name: string }> = new EventEmitter();
	@Output() departmentEdited: EventEmitter<{ id: number, name: string }> = new EventEmitter();
	@Output() departmentDeleted: EventEmitter<{ id: number, name: string }> = new EventEmitter();

	@Output() occupationAdded: EventEmitter<{ companyId: number, departmentId: number, departmentName: string }> = new EventEmitter();
	@Output() occupationEdited: EventEmitter<{ id: number }> = new EventEmitter();
	@Output() occupationDeleted: EventEmitter<{ id: number }> = new EventEmitter();
	constructor(
		private dialog: MatDialog
	) { }

	ngOnInit(): void {

	}

	addDepartment() {
		this.departmentAdded.emit({
			companyId: this.department.companyId,
			departmentId: this.department.departmentId,
			name: this.department.departmentName
		})
		// this.dialog
		// 	.open<DetailComponent, DialogData>(DetailComponent, {
		// 		width: '300px',
		// 		height: '400px',
		// 		data: {
		// 			dialogAction: DialogAction.Add,
		// 			dialogType: DialogType.Department,
		// 			id: this.department.departmentId,
		// 			name: this.department.departmentName
		// 		}
		// 	})
		// 	.afterClosed()
		// 	.subscribe(result => {
		// 		if (result) {
		// 			console.log(result);
		// 		}
		// 	})
	}

	addOccupation() {
		this.occupationAdded.emit({
			companyId: this.department.companyId,
			departmentId: this.department.departmentId,
			departmentName: this.department.departmentName
		})
		// this.dialog
		// 	.open<DetailComponent, DialogData>(DetailComponent, {
		// 		width: '300px',
		// 		height: '400px',
		// 		data: {
		// 			dialogAction: DialogAction.Add,
		// 			dialogType: DialogType.Occupation,
		// 			id: this.department.departmentId,
		// 			name: this.department.departmentName
		// 		}
		// 	})
		// 	.afterClosed()
		// 	.subscribe(result => {
		// 		if (result) {
		// 			console.log(result);
		// 		}
		// 	})
	}

	editDepartment() {
		this.departmentEdited.emit({
			id: this.department.departmentId,
			name: this.department.departmentName
		})
		// this.dialog
		// 	.open<DetailComponent, DialogData>(DetailComponent, {
		// 		width: '300px',
		// 		height: '400px',
		// 		data: {
		// 			dialogAction: DialogAction.Edit,
		// 			dialogType: DialogType.Department,
		// 			id: this.department.departmentId,
		// 			name: this.department.departmentName
		// 		}
		// 	})
		// 	.afterClosed()
		// 	.subscribe(result => {
		// 		if (result) {
		// 			console.log(result);
		// 		}
		// 	})
	}

	deleteDepartment() {
		this.departmentDeleted.emit({
			id: this.department.departmentId,
			name: this.department.departmentName
		})
	}

}
