import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { BackendService } from '../../backend.service';
import { Company } from './company';
import { DetailComponent } from './detail/detail.component';
import { ProjectService } from './project.service';

export interface Project {
	projectId: number;
	projectName: string;
	city: string;
	remark: string;
	projectTypeId
	projectTypeName: string;
	companyId: number;
	companyName: string;
	parentId: number;
	sequence: number;
	logoPath: string;
	siteplanPath: string;
	launchingDate: Date;
}

export interface Filter {
	search: string;
	companyId: number;
}

@Component({
	selector: 'app-project',
	templateUrl: './project.component.html',
	styleUrls: ['./project.component.scss']
})
export class ProjectComponent implements OnInit {

	companies: Array<Company> = [];
	dataSource: MatTableDataSource<Project> = new MatTableDataSource();
	// displayedColumns = ['no', 'projectName', 'companyName', 'city', 'remark', 'formattedLaunchingDate', 'actions'];
	// @ViewChild(MatPaginator) private paginator: MatPaginator;

	isInitialized: boolean;
	isProjectInitialized: boolean;

	filter: Filter = {
		search: '',
		companyId: 0
	};

	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private projectService: ProjectService,
		private dialog: MatDialog,
		private backendService: BackendService
	) { }

	ngOnInit(): void {
		if (!this.backendService.isMobile) {
			this.backendService.showSidebar()
				.then(() => this.getCompanies())
				.then(() => this.getProjects())
		} else {
			this.getCompanies()
				.then(() => this.getProjects());
		}
	}

	getCompanies() {
		this.isInitialized = false;
		return new Promise<void>((resolve, reject) => {
			this.projectService.getCompanies().subscribe((companies: Array<Company>) => {
				console.log('companies', companies);
				this.companies = companies;
				this.isInitialized = true;
				resolve();
			})
		});
	}

	getProjects() {
		this.isProjectInitialized = false;
		return new Promise<void>((resolve, reject) => {
			this.projectService.getProjects().subscribe((projects: Array<Project>) => {
				console.log('projects', projects);
				this.dataSource.data = projects;
				this.dataSource.filterPredicate = this.customFilter();
				// this.dataSource.paginator = this.paginator;
				this.isProjectInitialized = true;
				resolve();
			})
		});
	}


	searchChanged(e: Event) {
		const search = (e.target as HTMLInputElement).value.trim().toLowerCase();
		this.filter.search = search;
		this.dataSource.filter = JSON.stringify(this.filter);
		if (this.dataSource.paginator) {
			this.dataSource.paginator.firstPage();
		}
	}

	customFilter() {
		const _filter = (data: Project, filter: string): boolean => {
			const parsedFilter = JSON.parse(filter);
			return (parsedFilter.search ?
				(data.projectName.toLowerCase().trim().indexOf(parsedFilter.search.toLowerCase().trim()) !== -1)
				: true) &&
				(+parsedFilter.companyId === 0 ? true : (+data.companyId === +parsedFilter.companyId));
		};

		return _filter;
	}

	companyChanged(e: Event) {
		this.filter.companyId = +(e.target as HTMLSelectElement).value;
		this.dataSource.filter = JSON.stringify(this.filter);
		if (this.dataSource.paginator) {
			this.dataSource.paginator.firstPage();
		}
	}

	add() {
		this.dialog
			.open(DetailComponent, {
				width: '800px',
				// height: '677px',
				data: {}
			})
			.afterClosed()
			.subscribe(result => {
				if (result) {
					this.getProjects();
				}
			})
	}

	edit(e, projectId: number) {
		e.stopPropagation();
		e.preventDefault();
		this.dialog
			.open(DetailComponent, {
				width: '800px',
				height: '677px',
				data: {
					projectId
				}
			})
			.afterClosed()
			.subscribe(result => {
				if (result) {
					this.getProjects();
				}
			})
	}

	openSiteplan(e, projectId: number) {
		e.stopPropagation();
		e.preventDefault();
		this.router.navigate([projectId + '/siteplan'], {
			relativeTo: this.activatedRoute
		});
	}

	openSiteplanMapper(e, projectId: number) {
		e.stopPropagation();
		e.preventDefault();
		this.router.navigate([projectId + '/siteplan-mapper'], {
			relativeTo: this.activatedRoute
		});
	}
}
