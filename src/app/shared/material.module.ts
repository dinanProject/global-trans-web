import { NgModule } from '@angular/core';
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from '@angular/material/legacy-autocomplete';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyPaginatorModule as MatPaginatorModule } from '@angular/material/legacy-paginator';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';
import { MatLegacySliderModule as MatSliderModule } from '@angular/material/legacy-slider';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTreeModule } from '@angular/material/tree';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
	imports: [
		ClipboardModule,
		FlexLayoutModule,
		MatAutocompleteModule,
		MatButtonModule,
		MatButtonToggleModule,
		MatCheckboxModule,
		MatCardModule,
		MatSidenavModule,
		MatToolbarModule,
		MatIconModule,
		MatMenuModule,
		MatTableModule,
		MatListModule,
		MatDialogModule,
		MatPaginatorModule,
		MatTreeModule,
		MatDatepickerModule,
		MatNativeDateModule,
		MatSnackBarModule,
		MatSortModule,
		MatSliderModule,
		DragDropModule,
		MatInputModule,
		MatSlideToggleModule
	],
	exports: [
		ClipboardModule,
		FlexLayoutModule,
		MatAutocompleteModule,
		MatButtonModule,
		MatButtonToggleModule,
		MatCheckboxModule,
		MatCardModule,
		MatSidenavModule,
		MatToolbarModule,
		MatIconModule,
		MatMenuModule,
		MatTableModule,
		MatListModule,
		MatDialogModule,
		MatPaginatorModule,
		MatTreeModule,
		MatDatepickerModule,
		MatNativeDateModule,
		MatSnackBarModule,
		MatSortModule,
		MatSliderModule,
		DragDropModule,
		MatInputModule,
		MatSlideToggleModule
	],
	declarations: [],
})

export class MaterialModule { }
