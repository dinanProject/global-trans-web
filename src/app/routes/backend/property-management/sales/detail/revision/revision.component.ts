import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
	selector: 'app-revision',
	templateUrl: './revision.component.html',
	styleUrls: ['./revision.component.scss']
})
export class RevisionComponent implements OnInit {
	revisionReason: string;
	formSubmitAttempt: boolean;

	constructor(
		private dialogRef: MatDialogRef<RevisionComponent>
	) { }

	ngOnInit(): void {
	}

	save() {
		this.formSubmitAttempt = true;
		if (!this.revisionReason) {
			return;
		}

		this.dialogRef.close(this.revisionReason);
	}

}
