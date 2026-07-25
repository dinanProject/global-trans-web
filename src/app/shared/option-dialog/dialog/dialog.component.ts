import { Component, EventEmitter, Inject, Input, OnInit, TemplateRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';
import { OptionDirective } from '../option-dialog.component';

@Component({
	selector: 'app-dialog',
	templateUrl: './dialog.component.html',
	styleUrls: ['./dialog.component.scss']
})
export class DialogComponent<T> implements OnInit {

	isInitialized: boolean;

	title: string = '';
	placeholder: string = '';
	options: MatTableDataSource<T> = new MatTableDataSource();
	displayedColumns = ['no', 'description', 'actions'];
	search: FormControl<string> = new FormControl();
	optionTemplate: TemplateRef<OptionDirective>;

	onAdd: EventEmitter<T>;

	constructor(
		@Inject(MAT_DIALOG_DATA) private data: {
			title: string,
			placeholder: string,
			options: Observable<T[]>,
			onAdd?: EventEmitter<T>,
			optionTemplate: TemplateRef<OptionDirective>
		},
		private dialogRef: MatDialogRef<DialogComponent<T>>
	) { }

	ngOnInit(): void {
		this.isInitialized = false;
		this.title = this.data.title;
		this.placeholder = this.data.placeholder;
		this.optionTemplate = this.data.optionTemplate;

		this.onAdd = this.data.onAdd;
		this.search.valueChanges
			.subscribe(result => {
				this.options.filter = result?.toLowerCase().trim();
			})

		console.log(typeof this.data.options);

		this.data.options
			.toPromise()
			.then((options: T[]) => {
				console.log('options', options);
				this.options.data = options;
				this.isInitialized = true;
			})
		// this.onAdd.subscribe((result: any) => {
		// 	console.log('this.onAdd.subscribe', result);
		// });

	}

	select(option: T) {
		this.dialogRef.close(option);
	}

	add() {
		if (this.onAdd) {
			this.onAdd.emit();
		}
		this.dialogRef.close();
	}

}
