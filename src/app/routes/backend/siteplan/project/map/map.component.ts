import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { BackendService } from '../../../backend.service';
import { Project } from '../project';
import { Unit } from '../unit/unit';
import { MapService } from './map.service';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import { MatDialog } from '@angular/material/dialog';
import { DetailComponent } from './detail/detail.component';

@Component({
	selector: 'app-map',
	templateUrl: './map.component.html',
	styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {

	dataSource: MatTableDataSource<Unit> = new MatTableDataSource();
	project: Project;

	isInitialized: boolean;
	isSiteplanDownload: boolean;

	constructor(
		private backendService: BackendService,
		private mapService: MapService,
		private activatedRoute: ActivatedRoute,
		private dialog: MatDialog
	) { }

	ngOnInit(): void {
		this.isInitialized = false;
		setTimeout(() => {
			this.backendService.setToolbarSubtitle('New Diamond');
			this.backendService.hideSidebar();
		})
		const projectId: number = +this.activatedRoute.snapshot.paramMap.get('projectId');
		this.getProject(projectId);
	}

	getProject(projectId: number) {
		this.mapService.getProject(projectId).subscribe((project: Project) => {
			console.log('project', project);
			this.project = project;
			this.dataSource.data = project.units;

			this.isInitialized = true;
		})
	}

	salesEntry(unit: Unit) {
		if (unit.salesStatusName === 'Sold') {
			return;
		}

		this.dialog.open(DetailComponent, {
			width: '400px',
			data: {
				projectId: unit.projectId,
				unitId: unit.unitId
			}
		}).afterClosed().subscribe(result => {
			if (result) {
				this.getProject(this.project.projectId);
			}
		})
	}

	downloadSiteplan() {
		this.isSiteplanDownload = true;

		setTimeout(() => {
			const mapHolder: HTMLElement | null = document.getElementById('map-holder');
			// tslint:disable-next-line: no-non-null-assertion
			const clone: HTMLElement = mapHolder!.cloneNode(true) as HTMLElement;

			const style = clone.style;
			style.position = 'relative';
			style.top = window.innerHeight + 'px';
			style.left = '0px';
			style.transform = 'initial';

			clone.classList.add('siteplan-download');

			document.body.appendChild(clone);

			html2canvas(clone, {
				width: clone.clientWidth,
				height: clone.clientHeight,
				allowTaint: true,
				useCORS: true
			}).then(canvas => {
				const binStr = atob(canvas.toDataURL('image/jpeg').split(',')[1]);
				const len = binStr.length;
				const arr = new Uint8Array(len);

				for (let i = 0; i < len; i++) {
					arr[i] = binStr.charCodeAt(i);
				}

				const blob = new Blob([arr]);
				// console.log('blob', blob);
				saveAs(blob, 'siteplan-' + this.project.projectName.toLowerCase().replace(/ /g, '-') + '.jpg');
				clone.remove();

				this.isSiteplanDownload = false;
			});
		});
	}

}
