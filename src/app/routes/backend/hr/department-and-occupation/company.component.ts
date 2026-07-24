import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Department } from './department.component';
import { Occupation } from './occupation.component';

export interface Company {
	parentId?: number;
	parentName?: string;
	companyId: number;
	companyName: string;
	remark: string;
	address?: string;
	level?: number;
	occupations?: Occupation[];
	departments?: Department[];
	companies?: Company[];
}

@Component({
	selector: 'company-tree',
	templateUrl: './company.component.html',
	styleUrls: ['./company.component.scss']
})
export class CompanyComponent implements OnInit {

	@Input() company: Company;

	@Output() companyAdded: EventEmitter<{ id: number, name: string }> = new EventEmitter();
	@Output() companyEdited: EventEmitter<{ id: number, name: string }> = new EventEmitter();
	@Output() companyDeleted: EventEmitter<{ id: number, name: string }> = new EventEmitter();

	@Output() departmentAdded: EventEmitter<{ id: number, name: string }> = new EventEmitter();
	@Output() departmentEdited: EventEmitter<{ id: number, name: string }> = new EventEmitter();
	@Output() departmentDeleted: EventEmitter<{ id: number, name: string }> = new EventEmitter();

	@Output() occupationAdded: EventEmitter<{ id: number, name: string }> = new EventEmitter();
	@Output() occupationEdited: EventEmitter<{ id: number, name: string }> = new EventEmitter();
	@Output() occupationDeleted: EventEmitter<{ id: number, name: string }> = new EventEmitter();

	constructor(
		private dialog: MatDialog
	) { }

	ngOnInit(): void {
	}

	addCompany() {
		this.companyAdded.emit({
			id: this.company.companyId,
			name: this.company.companyName
		});
	}

	addDepartment() {
		this.departmentAdded.emit({
			id: this.company.companyId,
			name: this.company.companyName
		})
	}

	addOccupation() {
		this.occupationAdded.emit({
			id: 0,
			name: 'No Parent'
		});
	}

	editCompany() {
		this.companyEdited.emit({
			id: this.company.companyId,
			name: this.company.companyName
		})
	}

	deleteCompany() {
		this.companyDeleted.emit({
			id: this.company.companyId,
			name: this.company.companyName
		});
	}

}
