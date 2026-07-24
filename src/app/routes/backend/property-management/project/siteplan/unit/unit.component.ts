import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { BackendService } from 'src/app/routes/backend/backend.service';
import { SessionService } from 'src/app/services/session.service';
import { WebSocketService } from 'src/app/services/websocket.service';
import { Unit } from './unit';
import { UnitService } from './unit.service';

@Component({
	selector: 'app-unit',
	templateUrl: './unit.component.html',
	styleUrls: ['./unit.component.scss']
})
export class UnitComponent implements OnInit {

	unit: Unit;
	isInitialized: boolean;
	userId: number;

	constructor(
		private activatedRoute: ActivatedRoute,
		private backendService: BackendService,
		private unitService: UnitService,
		private webSocketService: WebSocketService,
		private sessionService: SessionService,
		private router: Router
	) { }

	ngOnInit(): void {
		this.isInitialized = false;
		const projectId: number = +this.activatedRoute.snapshot.paramMap.get('projectId');
		const unitId: number = +this.activatedRoute.snapshot.paramMap.get('unitId');
		this.userId = this.sessionService.getUser().userId;
		this.backendService.hideSidebar()
			.then(() => this.initWebSocket())
			.then(() => this.getUnit(projectId, unitId))
			.then(() => {
				this.isInitialized = true;
			})
	}

	initWebSocket() {
		return new Promise<void>((resolve) => {
			setTimeout(() => {
				this.webSocketService.listen('property-management', '/unit/status-changed').subscribe((result: any) => {
					const data = result.data;
					console.log('status-changed', data);

					if (data.unitId !== this.unit.unitId) {
						return;
					}
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

					if (data.unitId !== this.unit.unitId) {
						return;
					}

					this.unit.isLocked = true;
					this.unit.lockedUserName = data.fullName;
					this.unit.formattedLockedDate = formatDate(data.lockedDate, 'dd MMM yyyy HH:ss', 'en');
				});

				this.webSocketService.listen('property-management', '/unit/unlocked').subscribe((result: any) => {
					const data = result.data;
					console.log('unlocked', data);

					if (data.unitId !== this.unit.unitId) {
						return;
					}

					this.unit.isLocked = false;
					this.unit.lockedUserName = null;
					this.unit.formattedLockedDate = null;
				});

				resolve();

			}, 100);
		});
	}

	getUnit(projectId: number, unitId: number) {
		return new Promise<void>((resolve, reject) => {
			this.unitService.getUnit(projectId, unitId).subscribe((unit: Unit) => {
				console.log(unit);
				this.unit = unit;
				resolve();
			})
		});
	}

	lock() {
		return this.webSocketService.invoke('/property-management/unit/lock', { unitId: this.unit.unitId }).pipe(
			map(data => {
				if (data.status !== 'success') {
					// tslint:disable-next-line:no-string-throw
					// throw data;
					throw {
						data: 'fail',
						message: data.message
					};
				}
			})
		).toPromise();
	}

	reserve() {
		this.lock().then(() => {
			console.log('unit locked');
			this.router.navigate(['reservation'], { relativeTo: this.activatedRoute });
		});
	}

}
