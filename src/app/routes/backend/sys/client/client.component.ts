import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ClientService } from './client.service';
import { DetailComponent } from './detail/detail.component';

export interface Client {
	clientId: number;
	clientCode: string;
	clientName: string;
	clientLogoPath: string;
	remark: string;
}

@Component({
	selector: 'app-client',
	templateUrl: './client.component.html',
	styleUrls: ['./client.component.scss']
})
export class ClientComponent implements OnInit {

	isInitialized: boolean;
	dataSource: MatTableDataSource<Client> = new MatTableDataSource();
	displayedColumns = ['no', 'clientName', 'remark', 'actions'];

	constructor(
		private clientService: ClientService,
		private dialog: MatDialog
	) { }

	ngOnInit(): void {
		this.isInitialized = false;
		this.getClients();
	}

	searchChanged(e: Event) {

	}

	getClients() {
		this.clientService.getClients().subscribe((clients: Client[]) => {
			console.log(clients);
			this.dataSource.data = clients;
			this.isInitialized = true;
		})
	}

	deleteClient(clientId: number) {
		if (!confirm('Delete current client?')) {
			return;
		}

		this.clientService.deleteClient(clientId).subscribe(result => {
			this.getClients();
		})
	}
}
