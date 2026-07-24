import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { DetailComponent } from './detail/detail.component';
import { Team, TeamService } from './team.service';

export interface QueryParams {
	search?: string;
	'page-index'?: number;
}

@Component({
	selector: 'app-team',
	templateUrl: './team.component.html',
	styleUrls: ['./team.component.scss']
})
export class TeamComponent implements OnInit {

	isInitialized: boolean;

	dataSource: MatTableDataSource<Team> = new MatTableDataSource();
	displayedColumns = ['no', 'teamName', 'supervisorName', 'smName', 'gmName', 'salesCount', 'actions'];
	@ViewChild(MatPaginator) private paginator: MatPaginator;

	queryParams: QueryParams = {
		'page-index': 0
	}

	constructor(
		private teamService: TeamService,
		private dialog: MatDialog
	) { }

	ngOnInit(): void {
		this.isInitialized = false;
		this.getTeams();
	}

	getTeams() {
		return this.teamService.getTeams()
			.toPromise()
			.then((teams: Team[]) => {
				this.dataSource.data = teams.map((t: Team, i: number) => Object.assign({
					no: i + 1
				}, t));
				this.dataSource.paginator = this.paginator;
				this.isInitialized = true;
			})
	}

	searchChanged(value: string) {

	}

	addTeam() {
		this.dialog
			.open(DetailComponent, {
				width: '600px',
				data: {}
			})
			.afterClosed()
			.subscribe((result) => {
				if (result) {
					this.getTeams();
				}
			});
	}

	editTeam(teamId: number) {
		this.dialog
			.open(DetailComponent, {
				width: '600px',
				data: {
					teamId
				}
			})
			.afterClosed()
			.subscribe((result) => {
				if (result) {
					this.getTeams();
				}
			});
	}

	pageChanged(e: PageEvent) {

	}
}
