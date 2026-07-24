import { Component, ElementRef, HostListener, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { BackendService } from '../../../backend.service';
import { SiteplanMapperService } from './siteplan-mapper.service';

export interface Unit {
	unitId: number;
	unitName?: string;
	unitNo?: string;
	picX: number;
	picY: number;
	mapped?: boolean;
}

export interface Project {
	projectId: number;
	companyName: string;
	projectName: string;
	logoPath: string;
	siteplanPath: string;
}

export interface Filter {
	entityCd: string;
	projectNo: string;
}

@Component({
	selector: 'app-siteplan-mapper',
	templateUrl: './siteplan-mapper.component.html',
	styleUrls: ['./siteplan-mapper.component.scss']
})
export class SiteplanMapperComponent implements OnInit {

	project: Project;
	dataSource: MatTableDataSource<Unit> = new MatTableDataSource();

	isInitialized: boolean;
	isSaving: boolean;
	isMapping: boolean;
	isInputFocus: boolean;
	isDragging: boolean;
	isMappedChecked: boolean;
	isUnmappedChecked: boolean;

	isSiteplanInitialized: boolean;

	mapHolderX: number;
	mapHolderY: number;
	selectedUnitIndex: number;
	mappingUnit: Unit;

	mapImage: any;

	@ViewChild('mapContainer', { read: ElementRef, static: true }) mapContainer: ElementRef;
	mapImageWidth: number;
	mapImageHeight: number;
	mapContainerWidth: number;
	mapContainerHeight: number;

	@ViewChildren('unitMap', { read: ElementRef }) unitMaps: QueryList<ElementRef>;
	@ViewChildren('unitList', { read: ElementRef }) unitLists: QueryList<ElementRef>;

	loadedUnits: Unit[];

	constructor(
		private siteplanMapperService: SiteplanMapperService,
		private backendService: BackendService,
		private activatedRoute: ActivatedRoute
	) { }

	ngOnInit() {
		this.backendService.hideSidebar()
			.then(() => {
				this.isMappedChecked = true;
				this.isUnmappedChecked = true;
				const projectId = +this.activatedRoute.snapshot.paramMap.get('projectId');
				this.getProject(projectId)
					.then(() => {
					})
					.catch(err => alert(err));
			})
	}

	getProject(projectId: number) {
		this.isInitialized = false;
		this.isSiteplanInitialized = false;
		return new Promise<void>((resolve) => {
			this.siteplanMapperService.getProject(projectId).subscribe((data: { project: Project, units: Unit[] }) => {
				console.log(data);
				this.project = data.project;
				const units: Array<Unit> = data.units;
				for (const unit of units) {
					unit.mapped = unit.picX && unit.picY ? true : false;
				}

				this.loadedUnits = JSON.parse(JSON.stringify(units));
				this.dataSource.data = units;

				this.convertUrlToBase64(this.project.siteplanPath)
					.then((base64Image) => this.getImageSize(base64Image))
					.then((base64Image) => this.centerImage(base64Image))
					.then((base64Image) => {
						this.mapImage = base64Image;
						this.isSiteplanInitialized = true;
						this.isInitialized = true;
						resolve();
					});
			});
		});
	}


	initMapImage(mapImage, mapImageExists) {
		this.isSiteplanInitialized = false;
		return new Promise<void>((resolve) => {
			if (!mapImageExists) {
				this.isSiteplanInitialized = true;
				return resolve();
			}
			this.convertUrlToBase64(mapImage)
				.then((base64Image) => this.getImageSize(base64Image))
				.then((base64Image) => this.centerImage(base64Image))
				.then((base64Image) => {
					this.mapImage = base64Image;
					this.isSiteplanInitialized = true;
					resolve();
				});
		});
	}

	convertUrlToBase64(imagePath: string) {
		return new Promise((resolve) => {
			const loadBase64Image = (url) => fetch(url)
				.then(response => response.blob())
				.then(base64Data => {
					resolve(this.convertImageToBase64(base64Data));
				});
			loadBase64Image(imagePath);
		});
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

	getImageSize(base64Image) {
		return new Promise<any>((resolve) => {
			const img = new Image();
			img.addEventListener('load', () => {
				this.mapImageWidth = img.naturalWidth;
				this.mapImageHeight = img.naturalHeight;
				resolve(base64Image);
			});
			img.src = base64Image;
		});
	}

	centerImage(base64Image) {
		return new Promise((resolve) => {
			const container = this.mapContainer.nativeElement;
			console.log('container', container);
			console.log('offsetWidth', container.offsetWidth);
			console.log('width', (<HTMLDivElement>container).getBoundingClientRect().width);
			console.log('offsetWidth 2', (<HTMLDivElement>container).offsetWidth);
			this.mapContainerWidth = container.offsetWidth;
			this.mapContainerHeight = container.offsetHeight;
			this.mapHolderX = (this.mapContainerWidth / 2) - (this.mapImageWidth / 2);
			this.mapHolderY = (this.mapContainerHeight / 2) - (this.mapImageHeight / 2);
			resolve(base64Image);
		});
	}

	// KEY DOWN

	@HostListener('document:keydown.arrowup', ['$event']) onArrowUpKeyDown(event: KeyboardEvent) {
		event.preventDefault();
		if (this.isMapping) {
			this.isDragging = true;
			this.moveMap('up');
		} else {
			this.moveFocus('up');
		}
	}

	@HostListener('document:keydown.arrowright', ['$event']) onArrowRightKeyDown(event: KeyboardEvent) {
		event.preventDefault();
		if (this.isMapping) {
			this.isDragging = true;
			this.moveMap('right');
		}
	}

	@HostListener('document:keydown.arrowdown', ['$event']) onArrowDownKeyDown(event: KeyboardEvent) {
		event.preventDefault();
		if (this.isMapping) {
			this.isDragging = true;
			this.moveMap('down');
		} else {
			this.moveFocus('down');
		}
	}

	@HostListener('document:keydown.arrowleft', ['$event']) onArrowLeftKeyDown(event: KeyboardEvent) {
		event.preventDefault();
		if (this.isMapping) {
			this.isDragging = true;
			this.moveMap('left');
		}
	}

	// KEY UP

	@HostListener('document:keyup.arrowup', ['$event']) onArrowUpKeyUp(event: KeyboardEvent) {
		event.preventDefault();
		this.isDragging = false;
	}

	@HostListener('document:keyup.arrowright', ['$event']) onArrowRightKeyUp(event: KeyboardEvent) {
		event.preventDefault();
		this.isDragging = false;
	}

	@HostListener('document:keyup.arrowdown', ['$event']) onArrowDownKeyUp(event: KeyboardEvent) {
		event.preventDefault();
		this.isDragging = false;
	}

	@HostListener('document:keyup.arrowleft', ['$event']) onArrowLeftKeyUp(event: KeyboardEvent) {
		event.preventDefault();
		this.isDragging = false;
	}

	// CONTROL

	@HostListener('document:keydown.control.arrowup', ['$event']) onControlArrowUp(event: KeyboardEvent) {
		event.preventDefault();
		if (this.isMapping) {
			this.moveCtrlMap('up');
		}
	}

	@HostListener('document:keydown.control.arrowright', ['$event']) onControlArrowRight(event: KeyboardEvent) {
		event.preventDefault();
		if (this.isMapping) {
			this.moveCtrlMap('right');
		}
	}

	@HostListener('document:keydown.control.arrowdown', ['$event']) onControlArrowDown(event: KeyboardEvent) {
		event.preventDefault();
		if (this.isMapping) {
			this.moveCtrlMap('down');
		}
	}

	@HostListener('document:keydown.control.arrowleft', ['$event']) onControlArrowLeft(event: KeyboardEvent) {
		event.preventDefault();
		if (this.isMapping) {
			this.moveCtrlMap('left');
		}
	}

	// ALT

	@HostListener('document:keydown.alt.arrowup', ['$event']) onAltArrowUp(event: KeyboardEvent) {
		event.preventDefault();
		if (this.isMapping) {
			this.moveAltMap('up');
		}
	}

	@HostListener('document:keydown.alt.arrowright', ['$event']) onAltArrowRight(event: KeyboardEvent) {
		event.preventDefault();
		if (this.isMapping) {
			this.moveAltMap('right');
		}
	}

	@HostListener('document:keydown.alt.arrowdown', ['$event']) onAltArrowDown(event: KeyboardEvent) {
		event.preventDefault();
		if (this.isMapping) {
			this.moveAltMap('down');
		}
	}

	@HostListener('document:keydown.alt.arrowleft', ['$event']) onAltArrowLeft(event: KeyboardEvent) {
		event.preventDefault();
		if (this.isMapping) {
			this.moveAltMap('left');
		}
	}

	// MULTIPLE ARROW KEYS KEY DOWN

	@HostListener('document:keydown.arrowup.arrowright', ['$event']) onArrowUpRightKeyDown(event: KeyboardEvent) {
		event.preventDefault();
		this.isDragging = true;
		this.moveMap('upright');
	}

	@HostListener('document:keydown.arrowright.arrowdown', ['$event']) onArrowRightDownKeyDown(event: KeyboardEvent) {
		event.preventDefault();
		this.isDragging = true;
		this.moveMap('rightdown');
	}

	@HostListener('document:keydown.arrowdown.arrowleft', ['$event']) onArrowDownLeftKeyDown(event: KeyboardEvent) {
		event.preventDefault();
		this.isDragging = true;
		this.moveMap('downleft');
	}

	@HostListener('document:keydown.arrowleft.arrowup', ['$event']) onArrowLeftUpKeyDown(event: KeyboardEvent) {
		event.preventDefault();
		this.isDragging = true;
		this.moveMap('leftup');
	}

	// MULTIPLE ARROW KEYS KEY UP

	@HostListener('document:keyup.arrowup.arrowright', ['$event']) onArrowUpRightKeyUp(event: KeyboardEvent) {
		event.preventDefault();
		this.isDragging = false;
	}

	@HostListener('document:keyup.arrowright.arrowdown', ['$event']) onArrowRightDownKeyUp(event: KeyboardEvent) {
		event.preventDefault();
		this.isDragging = false;
	}

	@HostListener('document:keyup.arrowdown.arrowleft', ['$event']) onArrowDownLeftKeyUp(event: KeyboardEvent) {
		event.preventDefault();
		this.isDragging = false;
	}

	@HostListener('document:keyup.arrowleft.arrowup', ['$event']) onArrowLeftUpKeyUp(event: KeyboardEvent) {
		event.preventDefault();
		this.isDragging = false;
	}

	// OTHER KEYS

	@HostListener('document:keydown.enter', ['$event']) onEnter(event: KeyboardEvent) {
		event.preventDefault();
		if (!this.isMapping) {
			if (this.dataSource.data[this.selectedUnitIndex].mapped) {
				this.remapUnit(this.selectedUnitIndex);
			} else {
				this.mapUnit(this.selectedUnitIndex);
			}
		} else {
			this.applyMapUnit();
		}
	}

	@HostListener('document:keydown.esc', ['$event']) onKeyDown(event: KeyboardEvent) {
		event.preventDefault();
		if (this.isMapping) {
			this.cancelMapUnit();
		}
	}

	moveMap(direction: 'up' | 'down' | 'left' | 'right' | 'upright' | 'rightdown' | 'downleft' | 'leftup', point = 10) {
		if (direction === 'up') {
			this.mapHolderY += point;
		} else if (direction === 'down') {
			this.mapHolderY -= point;
		} else if (direction === 'left') {
			this.mapHolderX += point;
		} else if (direction === 'right') {
			this.mapHolderX -= point;
		} else if (direction === 'upright') {
			this.mapHolderY += point;
			this.mapHolderX -= point;
		} else if (direction === 'rightdown') {
			this.mapHolderX -= point;
			this.mapHolderY -= point;
		} else if (direction === 'downleft') {
			this.mapHolderY -= point;
			this.mapHolderX += point;
		} else if (direction === 'leftup') {
			this.mapHolderX += point;
			this.mapHolderY += point;
		}
	}

	moveCtrlMap(direction: 'up' | 'down' | 'left' | 'right' | 'upright' | 'rightdown' | 'downleft' | 'leftup') {
		this.moveMap(direction, 1);
	}

	moveAltMap(direction: 'up' | 'down' | 'left' | 'right' | 'upright' | 'rightdown' | 'downleft' | 'leftup') {
		this.moveMap(direction, 50);
	}

	moveFocus(direction: 'up' | 'down') {
		if (this.isMapping) {
			return;
		}
		if (direction === 'up') {
			this.selectedUnitIndex--;
			if (this.selectedUnitIndex < 0) {
				this.focusLastUnit();
			} else {
				this.focusUnitList();
			}
		} else {
			this.selectedUnitIndex++;
			if (this.selectedUnitIndex >= this.dataSource.data.length) {
				this.focusFirstUnit();
			} else {
				this.focusUnitList();
			}
		}

		if (this.dataSource.data[this.selectedUnitIndex].mapped) {
			this.focusUnitMap();
		}
	}

	customFilter() {
		const _filter = (data: Filter, filter: string): boolean => {
			const searchString = JSON.parse(filter);
			return (searchString.entityCd === '0' ? true : searchString.entityCd === data.entityCd)
				&& (searchString.projectNo === '0' ? true : searchString.projectNo === data.projectNo);
		};

		return _filter;
	}

	countMapped() {
		return this.dataSource.filteredData.filter(unit => {
			return unit.mapped;
		}).length;
	}

	countUnmapped() {
		return this.dataSource.filteredData.filter(unit => {
			return !unit.mapped;
		}).length;
	}

	selectUnitList(i: number) {
		this.selectedUnitIndex = i;
		if (this.dataSource.data[this.selectedUnitIndex].mapped) {
			this.focusUnitMap();
		}
	}

	selectUnitMap(i: number) {
		this.selectedUnitIndex = i;
		this.focusUnitList();
	}

	mapUnit(i: number) {
		if (!this.mapImage) {
			alert('Please upload siteplan image');
			return;
		}
		this.selectedUnitIndex = i;
		const unit = this.dataSource.data[this.selectedUnitIndex];
		if (unit.mapped) {
			return;
		}
		this.isMapping = true;
		this.mappingUnit = unit;
	}

	remapUnit(i: number) {
		if (!this.mapImage) {
			alert('Please upload siteplan image');
			return;
		}
		this.selectedUnitIndex = i;
		const unit = this.dataSource.data[this.selectedUnitIndex];
		this.isMapping = true;
		this.mappingUnit = unit;
	}

	clearUnit(i: number) {
		if (!this.mapImage) {
			alert('Please upload siteplan image');
			return;
		}
		this.selectedUnitIndex = i;
		const unit = this.dataSource.data[this.selectedUnitIndex];
		unit.picX = null;
		unit.picY = null;
		unit.mapped = false;
		this.mappingUnit = null;
		this.isMapping = false;
	}

	clearAllUnits() {
		if (!this.mapImage) {
			alert('Please upload siteplan image');
			return;
		}
		for (const unit of this.dataSource.data) {
			unit.picX = null;
			unit.picY = null;
			unit.mapped = false;
		}
	}

	applyMapUnit() {
		const unit = this.dataSource.data[this.selectedUnitIndex];
		unit.picX = (this.mapContainerWidth / 2) - this.mapHolderX;
		unit.picY = (this.mapContainerHeight / 2) - this.mapHolderY;
		console.log('apply', unit);
		unit.mapped = true;
		this.mappingUnit = null;
		this.isMapping = false;
	}

	cancelMapUnit() {
		this.isMapping = false;
		this.mappingUnit = null;
	}

	unmapUnit() {

	}

	locationChanged(event) {
		this.mapHolderX = event.x;
		this.mapHolderY = event.y;
	}

	getFocusedUnitMap() {
		return this.unitMaps.filter((unit: ElementRef, index) => {
			return index === this.selectedUnitIndex;
		})[0].nativeElement;
	}

	focusUnitMap() {
		if (!this.mapImage) {
			return;
		}
		const focusedUnit = this.getFocusedUnitMap();
		console.log('this.mapContainerWidth', this.mapContainerWidth)
		this.mapHolderX = (this.mapContainerWidth / 2) - focusedUnit.offsetLeft;
		this.mapHolderY = (this.mapContainerHeight / 2) - focusedUnit.offsetTop;
	}

	getFocusedUnitList() {
		return this.unitLists.filter((unit: ElementRef, index) => {
			return index === this.selectedUnitIndex;
		})[0].nativeElement;
	}

	focusUnitList() {
		const node = this.getFocusedUnitList();
		// focusedUnit tersembunyi diatas parent area
		const parentNode = node.parentNode;
		if (parentNode.scrollTop > node.offsetTop) {
			parentNode.scrollTop = node.offsetTop;
		} else {
			// focusedUnit terlihat didasar units visible area
			if (node.offsetTop + node.offsetHeight > parentNode.offsetHeight + parentNode.scrollTop) {
				parentNode.scrollTop = node.offsetTop - parentNode.offsetHeight + node.offsetHeight;
			}
		}
	}

	focusFirstUnit() {
		this.selectedUnitIndex = 0;
		const focusedUnit = this.getFocusedUnitList();
		focusedUnit.parentNode.scrollTop = 0;
	}

	focusLastUnit() {
		this.selectedUnitIndex = this.dataSource.data.length - 1;
		const focusedUnit = this.getFocusedUnitList();
		focusedUnit.parentNode.scrollTop = focusedUnit.parentNode.scrollHeight;
	}

	save() {
		const updatedUnits = [];
		for (const u of this.loadedUnits) {
			const unit: Unit = this.dataSource.data.find((un: Unit) => u.unitId === un.unitId);
			if (+unit.picX !== +u.picX || +unit.picY !== u.picY) {
				updatedUnits.push({
					unitId: unit.unitId,
					picX: unit.picX,
					picY: unit.picY
				})
			}
		}

		this.isSaving = true;
		this.siteplanMapperService.save(this.project.projectId, { updatedUnits }).subscribe(result => {
			this.isSaving = false;
		})
	}

}
