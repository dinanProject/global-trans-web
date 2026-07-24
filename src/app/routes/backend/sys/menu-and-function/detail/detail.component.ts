import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DetailService, Menu } from './detail.service';
import { ParentComponent } from './parent/parent.component';

@Component({
	selector: 'app-detail',
	templateUrl: './detail.component.html',
	styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {

	formGroup: UntypedFormGroup;
	menuId: UntypedFormControl;
	menuName: UntypedFormControl;
	menuCode: UntypedFormControl;
	route: UntypedFormControl;
	// openInId: FormControl;
	menuTypeId: UntypedFormControl;
	parentId: UntypedFormControl;
	parentName: UntypedFormControl;
	sequence: UntypedFormControl;
	icon: UntypedFormControl;

	title: string;
	formSubmitAttempt: boolean;
	menuTypes: Array<any> = [];
	// openIns: Array<any> = [];

	parentMenuCode: string;

	isInitialized: boolean;

	constructor(
		@Inject(MAT_DIALOG_DATA) private data: any,
		private dialog: MatDialog,
		private dialogRef: MatDialogRef<DetailComponent>,
		private formBuilder: UntypedFormBuilder,
		private detailService: DetailService
	) { }

	ngOnInit(): void {
		this.isInitialized = false;
		this.formSubmitAttempt = false;
		this.title = 'Edit Menu';
		if (this.data.mode === 'add') {
			this.title = 'Add Menu';
		}
		this.initForm()
			.then(() => this.getMenuTypes())
			// .then(() => this.getOpenIns())
			.then(() => this.getMenu())
			.then(() => {
				this.isInitialized = true;
			});
	}

	initForm() {
		return new Promise<void>((resolve, reject) => {
			this.menuId = new UntypedFormControl();
			this.menuName = new UntypedFormControl('', [Validators.required]);
			this.menuCode = new UntypedFormControl('', [Validators.required]);
			this.route = new UntypedFormControl();
			// this.openInId = new FormControl(1, [Validators.required]);
			this.menuTypeId = new UntypedFormControl(4, [Validators.required]);
			this.parentId = new UntypedFormControl(0);
			this.parentName = new UntypedFormControl();
			this.sequence = new UntypedFormControl(1);
			this.icon = new UntypedFormControl();
			this.formGroup = this.formBuilder.group({
				menuId: this.menuId,
				menuName: this.menuName,
				menuCode: this.menuCode,
				route: this.route,
				// openInId: this.openInId,
				menuTypeId: this.menuTypeId,
				parentId: this.parentId,
				parentName: this.parentName,
				sequence: this.sequence,
				icon: this.icon
			});

			this.menuName.valueChanges
				.subscribe(result => {
					const menuCode = result.trim().toLowerCase().replace(/ /g, '-');
					this.menuCode.setValue(this.parentMenuCode + '.' + menuCode);
				});

			resolve();
		});
	}

	getMenu() {
		return new Promise<void>((resolve, reject) => {
			this.detailService.getMenu(this.data.menuId).subscribe((menu: Menu) => {
				console.log('getMenuResult', menu);
				if (this.data.mode === 'add') {
					this.formGroup.setValue({
						menuId: null,
						menuName: '',
						menuCode: menu.menuCode,
						route: '',
						menuTypeId: menu.menuTypeId + 1,
						parentId: menu.menuId,
						parentName: menu.menuName,
						sequence: 1,
						icon: ''
					})
				} else {
					this.formGroup.setValue({
						menuId: menu.menuId,
						menuName: menu.menuName,
						menuCode: menu.menuCode,
						route: menu.route,
						menuTypeId: menu.menuTypeId,
						parentId: menu.parentId,
						parentName: menu.parentName,
						sequence: menu.sequence,
						icon: menu.icon
					})
				}

				this.parentMenuCode = menu.menuCode;

				resolve();
			})
		});
	}

	getMenuTypes() {
		return new Promise<void>((resolve, reject) => {
			this.detailService.getMenuTypes().subscribe(result => {
				this.menuTypes = result;
				console.log('menuTypes', this.menuTypes);
				resolve();
			})
		});
	}

	// getOpenIns() {
	// 	return new Promise<void>((resolve, reject) => {
	// 		this.detailService.getOpenIns().subscribe(result => {
	// 			this.openIns = result;
	// 			console.log('openIns', this.openIns);
	// 			resolve();
	// 		})
	// 	});
	// }

	openParent() {
		this.dialog.open(ParentComponent, {
			width: '460px',
			data: {
				parentId: this.parentId.value
			}
		}).afterClosed().subscribe(result => {
			if (result) {
				this.parentId.setValue(result.menuId);
				this.parentName.setValue(result.menuName);
			}
		})
	}

	/* get autoMenuCode() {
		if (!this.menuName.value) {
			return this.menuCode.value + '.';
		}
		return this.menuCode.value + '.' + this.menuName.value.toLowerCase().replace('\ \g', '-');
	} */

	save() {
		this.formSubmitAttempt = true;
		if (this.formGroup.invalid) {
			return;
		}

		console.log('save');

		const data = this.formGroup.value;
		if (this.data.mode === 'add') {
			this.detailService.insertMenu(data).subscribe(result => {
				if (result) {
					this.dialogRef.close(true);
				}
			})
		} else {
			this.detailService.updateMenu(this.data.menuId, data).subscribe(result => {
				if (result) {
					this.dialogRef.close(true);
				}
			})
		}
	}
}
