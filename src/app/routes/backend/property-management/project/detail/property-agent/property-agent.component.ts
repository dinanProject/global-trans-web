import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { PropertyAgent, PropertyAgentService } from './property-agent.service';

@Component({
	selector: 'app-property-agent',
	templateUrl: './property-agent.component.html',
	styleUrls: ['./property-agent.component.scss']
})
export class PropertyAgentComponent implements OnInit {

	isInitialized: boolean;

	dataSource: MatTableDataSource<PropertyAgent> = new MatTableDataSource();
	displayedColumns = ['no', 'propertyAgentName', 'actions'];
	// @ViewChild(MatPaginator) private paginator: MatPaginator;

	constructor(
		private propertyAgentService: PropertyAgentService,
		private dialogRef: MatDialogRef<PropertyAgentComponent>,
		@Inject(MAT_DIALOG_DATA) private data: { projectId: number }
	) { }

	ngOnInit(): void {
		this.isInitialized = false;
		this.getPropertyAgents();
	}

	searchChanged(value: string) {
		this.dataSource.filter = value.toLowerCase().trim();
	}

	getPropertyAgents() {
		this.propertyAgentService.getPropertyAgents(this.data.projectId)
			.toPromise()
			.then((propertyAgents: PropertyAgent[]) => {
				this.dataSource.data = propertyAgents;
				// this.dataSource.paginator = this.paginator;
				this.isInitialized = true;
			})
	}

	select(propertyAgent: PropertyAgent) {
		this.dialogRef.close(propertyAgent);
	}
}
