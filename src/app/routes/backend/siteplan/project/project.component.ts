import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { DetailComponent } from './detail/detail.component';
import { Project } from './project';
import { ProjectService } from './project.service';

@Component({
	selector: 'app-project',
	templateUrl: './project.component.html',
	styleUrls: ['./project.component.scss']
})
export class ProjectComponent implements OnInit {

	displayedColumns = ['no', 'projectName', 'city', 'remark', 'formattedLaunchingDate', 'actions'];
	dataSource = new MatTableDataSource<Project>();

	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

	constructor(
		private projectService: ProjectService,
		private dialog: MatDialog
	) { }

	ngOnInit(): void {
		this.getProjects();
	}

	getProjects() {
		this.projectService.getProjects().subscribe((projects: Array<Project>) => {
			this.dataSource.data = projects;
			this.dataSource.paginator = this.paginator;
		})
	}

	applyFilter(e: Event) {
		this.dataSource.filter = (e.target as HTMLInputElement).value.trim().toLowerCase();
		if (this.dataSource.paginator) {
			this.dataSource.paginator.firstPage();
		}
	}

	openDialog(projectId: number = null) {
		this.dialog.open(DetailComponent, {
			width: '600px',
			data: {
				projectId
			}
		}).afterClosed().subscribe(result => {
			if (result) {
				this.getProjects();
			}
		})
	}

	addProject() {
		this.openDialog();
	}

	editProject(projectId) {
		this.openDialog(projectId);
	}

	deleteProject(projectId) {
		if (confirm('Are you sure you want to delete current project?')) {
			this.projectService.deleteProject(projectId).subscribe(() => {
				this.getProjects();
			})
		}
	}

}
