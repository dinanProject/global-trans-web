import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionService } from 'src/app/services/session.service';
import { ProfileService } from './profile.service';

export interface User {
	userName: string;
	fullName: string;
	occupationName: string;
	userImagePath: string;
}

@Component({
	selector: 'app-profile',
	templateUrl: './profile.component.html',
	styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

	isInitialized: boolean;
	user: User;
	action: string;

	formGroup: UntypedFormGroup;
	currentPassword: UntypedFormControl;
	newPassword: UntypedFormControl;
	repeatPassword: UntypedFormControl;

	formSubmitAttempt: boolean;
	isUploadingProfilePicture: boolean;

	constructor(
		private activatedRoute: ActivatedRoute,
		private sessionService: SessionService,
		private router: Router,
		private profileService: ProfileService,
		private formBuilder: UntypedFormBuilder,
		private dialogRef: MatDialogRef<ProfileComponent>
	) { }

	ngOnInit(): void {
		this.isInitialized = false;
		this.currentPassword = new UntypedFormControl('', [Validators.required]);
		this.newPassword = new UntypedFormControl('', [Validators.required]);
		this.repeatPassword = new UntypedFormControl('', [Validators.required]);
		this.formGroup = this.formBuilder.group({
			currentPassword: this.currentPassword,
			newPassword: this.newPassword,
			repeatPassword: this.repeatPassword
		});

		this.getUserData();
	}

	getUserData() {
		this.profileService.getUserData().subscribe((user: User) => {
			console.log('user', user);
			this.user = user;
			this.isInitialized = true;
		})
	}

	changePassword() {
		this.action = 'change-password';
		this.dialogRef.updateSize('300px', '530px');
	}

	submitChangePassword() {
		this.formSubmitAttempt = true;
		if (this.newPassword.value !== this.repeatPassword.value) {
			this.repeatPassword.setErrors({
				passwordNotMatch: true
			});
		}

		if (this.formGroup.invalid) {
			return;
		}

		this.profileService.changePassword({
			currentPassword: this.currentPassword.value,
			newPassword: this.newPassword.value
		}).subscribe(result => {
			console.log(result);
			this.action = 'change-password-success';
			this.dialogRef.updateSize('300px', '460px');
			setTimeout(() => {
				this.action = null;
				this.dialogRef.close(true);
				// const returnUrl = this.activatedRoute.snapshot.url.;
				// this.router.navigateByUrl(returnUrl);
			}, 3000);
		})

	}

	convertImageToBase64(file) {
		console.log(file);
		return new Promise<string>((resolve) => {
			const fileReader: FileReader = new FileReader();
			fileReader.onloadend = () => {
				resolve(fileReader.result.toString());
			};
			fileReader.onerror = (e) => console.error(e);
			fileReader.readAsDataURL(file);
		});
	}

	uploadProfilePictureChanged(e) {
		this.isUploadingProfilePicture = true;
		const file: File = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];
		if (file) {
			this.convertImageToBase64(file)
				.then((base64Image) => {
					e.target.value = '';
					this.user.userImagePath = base64Image;
					const formData = new FormData();
					formData.append('profilePicture', file, file.name);
					this.profileService.uploadProfilePicture(formData)
						.subscribe(result => {
							setTimeout(() => {
								this.isUploadingProfilePicture = false;
								this.dialogRef.close(true);
							}, 1000);
						})
				});
		}
	}
}
