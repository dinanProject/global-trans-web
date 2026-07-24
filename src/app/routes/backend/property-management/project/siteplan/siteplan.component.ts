import { Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import { ActivatedRoute, Router } from '@angular/router';
import { Position, Project, SiteplanService, Unit } from './siteplan.service';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { BackendService } from '../../../backend.service';
import { WebSocketService } from 'src/app/services/websocket.service';
import { formatDate } from '@angular/common';

@Component({
	selector: 'app-siteplan',
	templateUrl: './siteplan.component.html',
	styleUrls: ['./siteplan.component.scss']
})
export class SiteplanComponent implements OnInit {

	isPanning: boolean;
	isZooming: boolean;

	projectId: number;

	startPosition: Position = { x: 0, y: 0 };
	position: Position = this.startPosition;
	scale = 1;
	maxScale = 2.4;
	minScale = 0.3;
	origin: Position = { x: 0, y: 0 };
	mousePosition: Position = { x: 0, y: 0 };
	zoomTimeout: NodeJS.Timeout;

	project: Project;
	isInitialized: boolean;
	isUnitRendered: boolean;
	isSiteplanDownload: boolean;

	@ViewChild('mapContainer') mapContainer: ElementRef<HTMLDivElement>;
	@ViewChild('mapHolder') mapHolder: ElementRef<HTMLDivElement>;
	@ViewChildren('lot', { read: ElementRef }) lots: QueryList<ElementRef>;

	constructor(
		private activatedRoute: ActivatedRoute,
		public sanitizer: DomSanitizer,
		private projectService: SiteplanService,
		private backendService: BackendService,
		private router: Router,
		private webSocketService: WebSocketService
	) { }

	ngOnInit(): void {
		this.isPanning = false;
		this.isZooming = false;
		this.isSiteplanDownload = false;
		this.isInitialized = false;
		this.projectId = +this.activatedRoute.snapshot.paramMap.get('projectId');
		this.backendService.hideSidebar()
			.then(() => this.initWebSocket())
			.then(() => this.getProject())
			.then((project: Project) => {
				this.project = project;
				console.log('project', project);
				this.isInitialized = true;
				this.lots.changes.subscribe(() => {
					setTimeout(() => {
						this.isUnitRendered = true;
					})
				});
			})

	}

	initWebSocket() {
		return new Promise<void>((resolve) => {
			setTimeout(() => {
				this.webSocketService.listen('property-management', '/unit/status-changed').subscribe((result: any) => {
					const data = result.data;
					console.log('status-changed', data);
					// const lot: any = this.dataSource.data.find((_lot: any) =>
					// 	_lot.entityCd === data.entityCd &&
					// 	_lot.projectNo === data.projectNo &&
					// 	_lot.kdUnit === data.kdUnit);

					// if (lot) {
					// 	const status = data.status;
					// 	lot.status = status.replace(/-/g, '_').toUpperCase();
					// 	lot.formattedStatus = status;
					// 	lot.reservedSource = status === 'reserved' ? 'ONLINE' : '';
					// } else {
					// 	console.log('lot not found');
					// 	this.getLots();
					// }
				});

				this.webSocketService.listen('property-management', '/unit/locked').subscribe((result: any) => {
					const data = result.data;
					console.log('locked', data);
					const unit: Unit = this.project.units.find((u: Unit) => u.unitId === data.unitId);
					if (!unit) {
						return;
					}

					unit.isLocked = true;
					unit.lockedUserName = data.fullName;
					unit.formattedLockedDate = formatDate(data.lockedDate, 'dd MMM yyyy HH:ss', 'en');
				});

				this.webSocketService.listen('property-management', '/unit/unlocked').subscribe((result: any) => {
					const data = result.data;
					console.log('unlocked', data);
					const unit: Unit = this.project.units.find((u: Unit) => u.unitId === data.unitId);
					if (!unit) {
						return;
					}

					unit.isLocked = false;
					unit.lockedUserName = null;
					unit.formattedLockedDate = null;
				});

				resolve();

			}, 100);
		});
	}

	getProject() {
		return new Promise<Project>((resolve, reject) => {
			this.projectService.getProject(this.projectId).subscribe((project: Project) => {
				resolve(project);
			})
		});
	}

	notFound() {
		this.router.navigateByUrl('/not-found', { skipLocationChange: true });
	}

	transformMapHolder(): SafeStyle {
		return this.sanitizer.bypassSecurityTrustStyle(
			`translateX(${this.position.x}px) translateY(${this.position.y}px) scale(${this.scale})`
		);
	}

	transformMapHolderOrigin(): SafeStyle {
		return this.sanitizer.bypassSecurityTrustStyle(
			`${this.origin.x}px ${this.origin.y}px`
		);
	}

	setScale(scale: number) {
		this.scale = scale;
	}

	getScale() {
		return this.scale;
	}

	setPosition(position: Position) {
		this.position = position;
	}

	setMousePosition(mousePosition: Position) {
		this.mousePosition = mousePosition;
	}

	centerMapHolder() {
		const mapHolderWidth = this.mapHolder.nativeElement.clientWidth;
		const mapHolderHeight = this.mapHolder.nativeElement.clientHeight;
		this.moveMapHolder({
			x: mapHolderWidth / 2,
			y: mapHolderHeight / 2
		});
	}

	moveMapHolder(position: Position) {
		const scale = this.getScale();
		const containerRef = this.mapContainer;
		const containerRefWidth = containerRef.nativeElement.clientWidth;
		const containerRefHeight = containerRef.nativeElement.clientHeight;
		const newPosition = {
			x: (containerRefWidth / 2) - (position.x * scale),
			y: (containerRefHeight / 2) - (position.y * scale)
		};
		this.setPosition(newPosition);
	}

	zoom(center, factor) {
		const scale = this.getScale();
		const newScale = scale * factor;
		if (newScale > this.maxScale || newScale < this.minScale) {
			return;
		}

		this.setScale(newScale);

		const mapHolderPosition: Position = this.mapHolder.nativeElement.getBoundingClientRect();
		const newPosition = {
			x: this.position.x - ((center.x - mapHolderPosition.x) * (factor - 1)),
			y: this.position.y - ((center.y - mapHolderPosition.y) * (factor - 1))
		};

		this.setPosition(newPosition);
	}

	zoomIn(center) {
		this.zoom(center, 1.1);
	}

	zoomOut(center) {
		this.zoom(center, 0.9);
	}

	onImageLoaded(event) {
		this.centerMapHolder();
	}

	onPanStart(event) {
		this.isPanning = true;
		this.startPosition = {
			x: this.position.x + event.deltaX,
			y: this.position.y + event.deltaY
		};
	}

	onPanMove(event) {
		this.setPosition({
			x: this.startPosition.x + event.deltaX,
			y: this.startPosition.y + event.deltaY
		});
	}

	onPanEnd(event) {
		this.isPanning = false;
	}

	onMouseMove(event: PointerEvent) {
		this.setMousePosition({
			x: event.x,
			y: event.y
		});
	}

	onMouseWheel(event: any) {
		event.stopImmediatePropagation();
		if (this.isZooming) {
			clearTimeout(this.zoomTimeout);
		}

		this.isZooming = true;
		this.zoomTimeout = setTimeout(() => {
			this.isZooming = false;
		}, 200);

		const delta = Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail)));
		if (delta > 0) {
			this.zoomIn(this.mousePosition);
		} else {
			this.zoomOut(this.mousePosition);
		}
	}

	onPinch(event: any) {
		this.isZooming = true;
		if (event.scale >= 1) {
			this.zoomIn(event.center);
		} else {
			this.zoomOut(event.center);
		}
		this.isZooming = false;
	}

	downloadSiteplan() {
		this.isSiteplanDownload = true;

		// setTimeout(() => {
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
		// this.isSiteplanDownload = false;
		// });
	}

}
