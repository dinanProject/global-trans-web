import { Injectable, Type } from '@angular/core';
import {
	MatDialog,
	MatDialogConfig,
	MatDialogRef,
} from '@angular/material/dialog';
import { AppDialogFlowAnimator, AppDialogFlowPoint } from './app-dialog-flow';

export interface AppDialogConfig<D = any> extends MatDialogConfig<D> {
	/**
	 * Set true only for flows that must not be dismissed by backdrop/Escape.
	 * The application default is intentionally dismissible.
	 */
	disableClose?: boolean;

	/**
	 * Optional element that triggered the dialog.
	 * The shared Flow animation opens from and closes back to this element.
	 */
	origin?: HTMLElement | null;
}

@Injectable({
	providedIn: 'root',
})
export class AppDialogService {
	private readonly defaults: MatDialogConfig = {
		maxWidth: '95vw',
		maxHeight: '94vh',
		autoFocus: false,
		restoreFocus: true,
		hasBackdrop: true,
		enterAnimationDuration: '0ms',
		exitAnimationDuration: '0ms',
		panelClass: ['app-dialog-panel', 'app-dialog-flow-prep'],
		backdropClass: ['app-dialog-backdrop'],
	};

	private dialogOriginCounter = 0;

	constructor(
		private readonly dialog: MatDialog,
		private readonly flow: AppDialogFlowAnimator,
	) {}

	open<T, D = any, R = any>(
		component: Type<T>,
		config: AppDialogConfig<D> = {},
	): MatDialogRef<T, R> {
		const { origin, disableClose, ...dialogConfig } = config;
		const requestedDisableClose = disableClose ?? false;
		const originPoint = this.getOriginPoint(origin);
		const originClass = `app-dialog-origin-${++this.dialogOriginCounter}`;

		/*
		 * Material's own enter/exit animation is disabled because the shared
		 * Flow animator owns the visual transition. Native close is temporarily
		 * wrapped so button, backdrop, Escape and programmatic close all use the
		 * same closing motion.
		 */
		const dialogRef = this.dialog.open<T, D, R>(component, {
			...this.defaults,
			...dialogConfig,
			disableClose: true,
			panelClass: this.mergeClasses(
				this.defaults.panelClass,
				this.mergeClasses(dialogConfig.panelClass, originClass),
			),
			backdropClass: this.mergeClasses(
				this.defaults.backdropClass,
				dialogConfig.backdropClass,
			),
		});

		const nativeClose = dialogRef.close.bind(dialogRef);
		let closing = false;

		dialogRef.close = ((result?: R): void => {
			if (closing) {
				return;
			}

			closing = true;
			const overlayPane = this.findOverlayPane(originClass);

			if (!overlayPane) {
				nativeClose(result);
				return;
			}

			void this.flow
				.close(overlayPane, originPoint)
				.finally(() => nativeClose(result));
		}) as MatDialogRef<T, R>['close'];

		dialogRef.afterOpened().subscribe(() => {
			const overlayPane = this.findOverlayPane(originClass);

			if (!overlayPane) {
				return;
			}

			void this.flow.open(overlayPane, originPoint);
		});

		if (!requestedDisableClose) {
			dialogRef.backdropClick().subscribe(() => {
				dialogRef.close();
			});

			dialogRef.keydownEvents().subscribe((event: KeyboardEvent) => {
				if (event.key !== 'Escape') {
					return;
				}

				event.preventDefault();
				event.stopPropagation();
				dialogRef.close();
			});
		}

		return dialogRef;
	}

	closeAll(): void {
		this.dialog.openDialogs.forEach((dialogRef) => dialogRef.close());
	}

	private findOverlayPane(originClass: string): HTMLElement | null {
		return document.querySelector<HTMLElement>(
			`.cdk-overlay-pane.${originClass}`,
		);
	}

	private getOriginPoint(
		origin?: HTMLElement | null,
	): AppDialogFlowPoint | null {
		if (!origin) {
			return null;
		}

		const rect = origin.getBoundingClientRect();
		return {
			x: rect.left + rect.width / 2,
			y: rect.top + rect.height / 2,
		};
	}

	private mergeClasses(
		base?: string | string[],
		extra?: string | string[],
	): string[] {
		const result: string[] = [];

		[base, extra].forEach((value) => {
			if (Array.isArray(value)) {
				result.push(...value);
			} else if (value) {
				result.push(value);
			}
		});

		return result.filter(
			(value, index, all) => all.indexOf(value) === index,
		);
	}
}
