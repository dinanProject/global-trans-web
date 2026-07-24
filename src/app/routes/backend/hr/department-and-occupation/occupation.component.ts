import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DetailComponent, DialogAction, DialogData, DialogType } from './detail/detail.component';

export interface Occupation {
	departmentId: number;
	occupationId: number;
	occupationName: string;
	occupationLevelId: number;
	occupationLevelName: string;
	level: number;
	remark: string;
}

@Component({
	selector: 'occupation-tree',
	templateUrl: './occupation.component.html',
	styleUrls: ['./occupation.component.scss']
})
export class OccupationComponent implements OnInit {

	@Input() occupation: Occupation;

	@Output() occupationEdited: EventEmitter<{ id: number, name: string }> = new EventEmitter();
	@Output() occupationDeleted: EventEmitter<{ id: number, name: string }> = new EventEmitter();

	constructor(
		private dialog: MatDialog
	) { }

	ngOnInit(): void {
	}

	editOccupation() {
		this.occupationEdited.emit({
			id: this.occupation.occupationId,
			name: this.occupation.occupationName
		})
		// this.dialog
		// 	.open<DetailComponent, DialogData>(DetailComponent, {
		// 		width: '300px',
		// 		height: '400px',
		// 		data: {
		// 			dialogAction: DialogAction.Edit,
		// 			dialogType: DialogType.Occupation,
		// 			id: this.occupation.occupationId,
		// 			name: this.occupation.occupationName,
		// 		}
		// 	})
		// 	.afterClosed()
		// 	.subscribe(result => {
		// 		if (result) {
		// 			console.log(result);
		// 		}
		// 	})
	}

	deleteOccupation() {
		this.occupationDeleted.emit({
			id: this.occupation.occupationId,
			name: this.occupation.occupationName
		})
	}
}
