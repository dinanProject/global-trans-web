import { Component, Inject, OnInit } from '@angular/core';
import { Form, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { DetailService } from './detail.service';

export interface Role {
	roleId: number;
	roleName: string;
	remark: string;
}

export interface User {
	userId: number;
	fullName: string;
	employeeCode: string;
	grantedDate: string;
	grantedTime: string;
	grantedUser: string;
	grantedEmployeeCode: string;
	userImagePath: string;
}

export interface Menu {
	roleId: number;
	menuId: number;
	menuName: string;
	menuTypeId: number;
	parentId: number;
	icon: string;
	isChecked: boolean;
	isIndeterminate: boolean;
	level: number;
	child: Menu[];
}

@Component({
	selector: 'app-detail',
	templateUrl: './detail.component.html',
	styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {

	roleId: number;
	mode: 'add' | 'edit';

	formGroup: UntypedFormGroup;
	roleName: UntypedFormControl;
	remark: UntypedFormControl;

	displayedColumns: Array<string> = ['no', 'userName', 'createdUser', 'createdDate', 'actions'];
	dataSource: MatTableDataSource<any> = new MatTableDataSource();

	loadedMenuIds: number[] = [];
	menus: Array<Menu> = [];

	activeTab = 'menu-and-functions';
	formSubmitAttempt: boolean;
	isSaving: boolean;

	constructor(
		@Inject(MAT_DIALOG_DATA) private data: any,
		private detailService: DetailService,
		private formBuilder: UntypedFormBuilder,
		private dialogRef: MatDialogRef<DetailComponent>
	) { }

	ngOnInit(): void {
		this.roleId = this.data.roleId;
		this.initForm()
			.then(() => this.getRole());
	}

	initForm() {
		return new Promise<void>((resolve, reject) => {
			this.roleName = new UntypedFormControl('', [Validators.required]);
			this.remark = new UntypedFormControl('');
			this.formGroup = this.formBuilder.group({
				roleName: this.roleName,
				remark: this.remark
			});
			resolve();
		});
	}

	getRole() {
		return new Promise<void>((resolve, reject) => {
			// if (this.data.mode === 'add') {
			// 	return resolve();
			// }
			this.detailService
				.getRole(this.data.roleId).subscribe((data: { role: Role, users: User[], menus: Menu[] }) => {
					console.log(data);
					const role = data.role;
					if (role) {
						this.roleId = role.roleId;
						this.formGroup.setValue({
							roleName: role.roleName,
							remark: role.remark
						});
					}

					this.loadedMenuIds = this.getCheckedMenuIds(JSON.parse(JSON.stringify(data.menus)));
					this.menus = data.menus;
					this.dataSource.data = data.users;
					resolve();
				})
		});
	}

	childChange(menu: Menu) {
		this.menus.map((m: Menu) => this.menus.find((mn: Menu) => menu.menuId === mn.menuId) || m);
	}

	getCheckedMenuIds(menus: Menu[]) {
		const result = [];
		for (const menu of menus) {
			if (menu.isChecked || menu.isIndeterminate) {
				result.push(menu.menuId);
			}
			if (menu.child.length > 0) {
				result.push(...this.getCheckedMenuIds(menu.child))
			}
		}
		return result;
	}

	save() {
		this.isSaving = true;
		this.formSubmitAttempt = true;
		if (this.formGroup.invalid) {
			this.isSaving = false;
			return;
		}

		const data = this.formGroup.value;
		// const checkedMenuIds = this.getCheckedMenuIds(this.menus);

		const checkedMenuIds = this.getCheckedMenuIds(this.menus);
		data.addedMenus = [...new Set(checkedMenuIds.filter(menuId => !this.loadedMenuIds.includes(menuId)))];
		data.deletedMenus = [...new Set(this.loadedMenuIds.filter(menuId => !checkedMenuIds.includes(menuId)))];

		console.log(data);

		if (this.roleId) {
			this.detailService.update(this.roleId, data).subscribe(result => {
				setTimeout(() => {
					this.isSaving = false;
					this.dialogRef.close(true);
				}, 500)
			})
		} else {
			this.detailService.insert(data).subscribe(result => {
				setTimeout(() => {
					this.isSaving = false;
					this.dialogRef.close(true);
				}, 500)
			})
		}
	}
}
