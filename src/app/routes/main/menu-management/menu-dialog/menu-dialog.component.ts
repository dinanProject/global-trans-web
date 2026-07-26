import { Component, Inject, OnInit } from '@angular/core';
import {
	FormBuilder,
	FormControl,
	FormGroup,
	Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
	Menu,
	MenuDialogData,
	MenuDialogResult,
	MenuPayload,
} from '../menu-management.service';

interface MenuForm {
	parentUuid: FormControl<string | null>;
	code: FormControl<string>;
	menuName: FormControl<string>;
	route: FormControl<string | null>;
	icon: FormControl<string | null>;
	permissionId: FormControl<number | null>;
	sequence: FormControl<number>;
	isActive: FormControl<boolean>;
}

@Component({
	selector: 'app-menu-dialog',
	templateUrl: './menu-dialog.component.html',
	styleUrls: ['./menu-dialog.component.scss'],
	standalone: false,
})
export class MenuDialogComponent implements OnInit {
	formGroup!: FormGroup<MenuForm>;

	formSubmitAttempt = false;
	isEdit = false;

	parentMenus: Menu[] = [];

	constructor(
		private formBuilder: FormBuilder,
		private dialogRef: MatDialogRef<MenuDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: MenuDialogData,
	) {}

	ngOnInit(): void {
		this.isEdit = this.data.mode === 'edit';

		this.parentMenus = this.getAllowedParentMenus();
		const currentMenu = this.data.menu;

		const currentParent =
			currentMenu?.parentId != null
				? this.data.menus.find(
						(menu) => menu.menuId === currentMenu.parentId,
					)
				: null;

		const parentUuid =
			this.data.mode === 'create'
				? (this.data.parentMenu?.uuid ?? null)
				: (currentParent?.uuid ?? null);

		this.formGroup = this.formBuilder.group<MenuForm>({
			parentUuid: new FormControl(parentUuid),
			code: new FormControl(this.data.menu?.code ?? '', {
				nonNullable: true,
				validators: [Validators.required, Validators.maxLength(100)],
			}),
			menuName: new FormControl(this.data.menu?.menuName ?? '', {
				nonNullable: true,
				validators: [Validators.required, Validators.maxLength(150)],
			}),
			route: new FormControl(this.data.menu?.route ?? null, [
				Validators.maxLength(255),
			]),
			icon: new FormControl(this.data.menu?.icon ?? null, [
				Validators.maxLength(100),
			]),
			permissionId: new FormControl(this.data.menu?.permissionId ?? null),
			sequence: new FormControl(this.data.menu?.sequence ?? 0, {
				nonNullable: true,
				validators: [Validators.required, Validators.min(0)],
			}),
			isActive: new FormControl(this.data.menu?.isActive ?? true, {
				nonNullable: true,
			}),
		});
	}

	get canSelectParent(): boolean {
		return this.data.mode === 'create' && !this.data.parentMenu;
	}

	get parentMenuName(): string {
		if (this.data.mode === 'create' && this.data.parentMenu) {
			return this.data.parentMenu.menuName;
		}

		if (this.data.mode === 'edit') {
			const currentMenu = this.data.menu;

			if (!currentMenu?.parentId) {
				return 'Root Menu';
			}

			const parentMenu = this.data.menus.find(
				(menu) => menu.menuId === currentMenu.parentId,
			);

			return parentMenu?.menuName ?? 'Root Menu';
		}

		return 'Root Menu';
	}

	submit(): void {
		this.formSubmitAttempt = true;

		if (this.formGroup.invalid) {
			this.formGroup.markAllAsTouched();
			return;
		}

		const value = this.formGroup.getRawValue();

		const payload: MenuPayload = {
			parentUuid: value.parentUuid || null,
			code: value.code.trim().toUpperCase(),
			menuName: value.menuName.trim(),
			route: this.normalizeNullableString(value.route),
			icon: this.normalizeNullableString(value.icon),
			permissionId: value.permissionId,
			sequence: Number(value.sequence),
			isActive: value.isActive,
		};

		const result: MenuDialogResult = {
			action: 'save',
			payload,
		};

		this.dialogRef.close(result);
	}

	close(): void {
		this.dialogRef.close();
	}

	isInvalid(controlName: keyof MenuForm): boolean {
		const control = this.formGroup.controls[controlName];

		return Boolean(
			control.invalid && (control.touched || this.formSubmitAttempt),
		);
	}

	private getAllowedParentMenus(): Menu[] {
		const currentMenu = this.data.menu;

		if (!currentMenu) {
			return this.data.menus;
		}

		const excludedMenuIds = new Set<number>([
			currentMenu.menuId,
			...this.getDescendantIds(currentMenu.menuId, this.data.menus),
		]);

		return this.data.menus.filter(
			(menu) => !excludedMenuIds.has(menu.menuId),
		);
	}

	private getDescendantIds(parentId: number, menus: Menu[]): number[] {
		const descendantIds: number[] = [];

		const children = menus.filter((menu) => menu.parentId === parentId);

		for (const child of children) {
			descendantIds.push(child.menuId);

			descendantIds.push(...this.getDescendantIds(child.menuId, menus));
		}

		return descendantIds;
	}

	private normalizeNullableString(value: string | null): string | null {
		if (!value) {
			return null;
		}

		const normalizedValue = value.trim();

		return normalizedValue || null;
	}
}
