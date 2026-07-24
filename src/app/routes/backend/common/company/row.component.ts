import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Company } from './company.component';

@Component({
	selector: 'company-tree',
	templateUrl: './row.component.html',
	styleUrls: ['./row.component.scss']
})
export class RowComponent implements OnInit {

	@Input() company: Company;

	@Output() companyAdded: EventEmitter<number> = new EventEmitter();
	@Output() companyEdited: EventEmitter<number> = new EventEmitter();
	@Output() companyDeleted: EventEmitter<number> = new EventEmitter();

	constructor() { }

	ngOnInit(): void {
	}

	addCompany() {
		this.companyAdded.emit(this.company.companyId);
	}

	editCompany() {
		this.companyEdited.emit(this.company.companyId)
	}

	deleteCompany() {
		this.companyDeleted.emit(this.company.companyId);
	}
}
