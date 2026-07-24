import { DialogRef } from '@angular/cdk/dialog';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Team } from '../../team.service';
import { ChangeTeamService } from './change-team.service';

@Component({
	selector: 'app-change-team',
	templateUrl: './change-team.component.html',
	styleUrls: ['./change-team.component.scss']
})
export class ChangeTeamComponent implements OnInit {

	isSaving: boolean;
	teams: Team[];
	selectedTeamId: number;

	constructor(
		private changeTeamService: ChangeTeamService,
		private dialogRef: MatDialogRef<ChangeTeamComponent>,
		@Inject(MAT_DIALOG_DATA) private data: { salesInhouseId: number, selectedTeamId: number }
	) { }

	ngOnInit(): void {
		this.changeTeamService.getTeams()
			.toPromise()
			.then((teams: Team[]) => {
				this.teams = teams;
				this.selectedTeamId = this.data.selectedTeamId;
			})
	}

	submit() {
		this.isSaving = true;
		this.changeTeamService.changeTeam(this.selectedTeamId, this.data.salesInhouseId)
			.subscribe(result => {
				this.isSaving = false;
				this.dialogRef.close(true);
			}, err => {
				console.log(err);
				this.isSaving = false;
			})
	}

}
