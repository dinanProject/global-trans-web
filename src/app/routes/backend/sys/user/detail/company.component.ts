import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { Company } from './detail.service';

@Component({
	selector: 'company-tree',
	templateUrl: './company.component.html',
	styleUrls: ['./company.component.scss']
})
export class CompanyComponent implements OnInit {

	@Input() company: Company;
	@Output() changed = new EventEmitter<Company>();
	@Output() indeterminateChanged = new EventEmitter<Company>();

	constructor() { }

	ngOnInit(): void {
	}

	change(e: MatCheckboxChange) {
		this.company.isChecked = e.checked;
		this.company.isIndeterminate = false;
		this.company.child.forEach((c: Company) => {
			c.isChecked = e.checked;
			c.isIndeterminate = false;
			this.checkChild(c, e.checked);
		});
		this.changed.emit(this.company);
	}

	checkChild(company: Company, value: boolean) {
		for (const c of company.child) {
			c.isChecked = value;
			c.isIndeterminate = false;
			this.checkChild(c, value);
		}
	}

	childChange(company: Company) {
		// re-set child array isChecked and isIndeterminate value
		const child = this.company.child.find((c: Company) => c.companyId === company.companyId);
		// child.isChecked = company.isChecked;
		// child.isIndeterminate = company.isIndeterminate;

		// calculate checked child
		const childCount = this.company.child.length;
		const checkedChildCount = this.company.child.filter((m: Company) => m.isChecked).length;
		const indeterminateChildCount = this.company.child.filter((m: Company) => m.isIndeterminate).length;
		if (checkedChildCount === childCount) {
			this.company.isChecked = true;
			this.company.isIndeterminate = false;
		} else if (checkedChildCount === 0) {
			this.company.isChecked = false;
			this.company.isIndeterminate = indeterminateChildCount > 0;
		} else {
			this.company.isChecked = false;
			this.company.isIndeterminate = true;
		}
		child.isChecked = company.isChecked;
		child.isIndeterminate = company.isIndeterminate;
		this.changed.emit(this.company);
	}

	indeterminateChange(e) {
		this.indeterminateChanged.emit(this.company);
	}

	childIndeterminateChange(company: Company) {
		setTimeout(() => {
			// re-set child array isChecked and isIndeterminate value
			const child = this.company.child.find((c: Company) => c.companyId === company.companyId);
			child.isChecked = company.isChecked;
			child.isIndeterminate = company.isIndeterminate;

			// calculate checked child
			const childCount = this.company.child.length;
			const checkedChildCount = this.company.child.filter((m: Company) => m.isChecked).length;
			const indeterminateChildCount = this.company.child.filter((m: Company) => m.isIndeterminate).length;
			if (checkedChildCount === childCount) {
				this.company.isChecked = true;
				this.company.isIndeterminate = false;
			} else if (checkedChildCount === 0) {
				this.company.isChecked = false;
				this.company.isIndeterminate = indeterminateChildCount > 0;
			} else {
				this.company.isChecked = false;
				this.company.isIndeterminate = true;
			}
			this.indeterminateChanged.emit(this.company);
		}, 100)
	}
}
