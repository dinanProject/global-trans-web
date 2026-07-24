import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Client, Config, DetailService, Menu, Role } from './detail.service';
import { environment as env } from 'src/environments/environment';

@Component({
	selector: 'app-detail',
	templateUrl: './detail.component.html',
	styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {

	clientId: number | string;
	apiUrl = env.apiUrl;
	// client: Client;

	formGroup: UntypedFormGroup;
	clientCode: UntypedFormControl;
	clientName: UntypedFormControl;
	remark: UntypedFormControl;

	clientLogoPath: any;

	menus: Menu[];
	roles: Role[];
	configs: Config[];

	loadedMenuIds: number[] = [];
	loadedRoleIds: number[] = [];

	isInitialized: boolean;
	formSubmitAttempt: boolean;
	isLogoUpload: boolean;

	constructor(
		private activatedRoute: ActivatedRoute,
		private detailService: DetailService,
		private formBuilder: UntypedFormBuilder,
		private router: Router
	) { }

	ngOnInit(): void {
		this.formSubmitAttempt = false;
		this.isInitialized = false;

		this.clientCode = new UntypedFormControl('', [Validators.required]);
		this.clientName = new UntypedFormControl('', [Validators.required]);
		this.remark = new UntypedFormControl();

		this.formGroup = this.formBuilder.group({
			clientCode: this.clientCode,
			clientName: this.clientName,
			remark: this.remark,
		})

		this.clientId = this.activatedRoute.snapshot.paramMap.get('clientId');
		this.getClient();
	}

	getClient() {
		this.detailService.getClient(this.clientId).subscribe((data: {
			client: Client,
			menus: Menu[],
			roles: Role[],
			configs: Config[]
		}) => {
			this.clientLogoPath = this.apiUrl + '/images/client/default-client.jpg';

			if (data.client) {
				const client = data.client;
				this.formGroup.setValue({
					clientCode: client.clientCode,
					clientName: client.clientName,
					remark: client.remark,
				})

				this.clientLogoPath = client.clientLogoPath;
			}

			this.menus = data.menus;
			this.roles = data.roles;
			this.configs = data.configs;

			this.loadedMenuIds = this.getCheckedMenuIds(JSON.parse(JSON.stringify(data.menus)));
			this.loadedRoleIds = data.roles.filter((role: Role) => role.isChecked).map((r: Role) => r.roleId);

			this.isInitialized = true;
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

	toggleRole(role: Role) {
		role.isChecked = !role.isChecked;
	}

	uploadLogoChanged(e) {
		const file: File = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];
		if (file) {
			this.convertImageToBase64(file)
				.then((base64Image) => {
					this.isLogoUpload = true;
					this.clientLogoPath = base64Image;
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

	dataURItoBlob(dataURI) {
		const binary = atob(dataURI.split(',')[1]);
		const array = [];
		for (let i = 0; i < binary.length; i++) {
			array.push(binary.charCodeAt(i));
		}

		return new Blob([new Uint8Array(array)], {
			type: 'image/jpeg'
		});
	}

	save() {
		this.formSubmitAttempt = true;
		if (this.formGroup.invalid) {
			return;
		}

		const data = this.formGroup.value;
		const checkedMenuIds = this.getCheckedMenuIds(this.menus);
		data.addedMenus = [...new Set(checkedMenuIds.filter(menuId => !this.loadedMenuIds.includes(menuId)))];
		data.deletedMenus = [...new Set(this.loadedMenuIds.filter(menuId => !checkedMenuIds.includes(menuId)))];

		data.configs = this.configs.map((config: Config) => ({
			configId: config.configId,
			configValue: config.configValue,
		}));

		const checkedRoles = this.roles.filter((role: Role) => role.isChecked).map((r: Role) => r.roleId);
		data.addedRoles = checkedRoles.filter(roleId => !this.loadedRoleIds.includes(roleId));
		data.deletedRoles = this.loadedRoleIds.filter(roleId => !checkedRoles.includes(roleId));

		const formData = new FormData();
		formData.append('data', JSON.stringify(data));

		if (this.isLogoUpload) {
			const logoImage = this.dataURItoBlob(this.clientLogoPath);
			formData.append('logo', logoImage, 'logo.jpg');
		}

		if (this.clientId === 'new') {
			this.detailService.insertClient(formData).subscribe(result => {
				console.log(result);
				this.router.navigateByUrl(`/backend/sys/client/${result}`);
				// this.ngOnInit();
			});
		} else {
			this.detailService.updateClient(+this.clientId, formData).subscribe(result => {
				console.log(result);
				this.ngOnInit();
			});
		}
	}
}
