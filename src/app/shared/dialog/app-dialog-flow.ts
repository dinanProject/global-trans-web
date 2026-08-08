import { Injectable } from '@angular/core';

export interface AppDialogFlowPoint {
	x: number;
	y: number;
}

@Injectable({
	providedIn: 'root',
})
export class AppDialogFlowAnimator {
	private readonly openDuration = 620;
	private readonly closeDuration = 480;

	async open(
		overlayPane: HTMLElement,
		origin: AppDialogFlowPoint | null,
	): Promise<void> {
		const surface = this.getSurface(overlayPane);
		if (!surface) {
			overlayPane.classList.remove('app-dialog-flow-prep');
			return;
		}

		if (this.prefersReducedMotion()) {
			overlayPane.classList.remove('app-dialog-flow-prep');
			return;
		}

		const rect = surface.getBoundingClientRect();
		const target = origin ?? this.fallbackOrigin(rect);
		this.applyTransformOrigin(surface, rect, target);

		const animation = surface.animate(
			[
				{
					opacity: 1,
					transform: 'scale3d(0.055, 0.085, 1)',
					offset: 0,
				},
				{
					opacity: 1,
					transform: 'scale3d(0.12, 0.18, 1)',
					offset: 0.22,
				},
				{
					opacity: 1,
					transform: 'scale3d(0.28, 0.42, 1)',
					offset: 0.44,
				},
				{
					opacity: 1,
					transform: 'scale3d(0.58, 0.76, 1)',
					offset: 0.66,
				},
				{
					opacity: 1,
					transform: 'scale3d(0.88, 0.96, 1)',
					offset: 0.84,
				},
				{
					opacity: 1,
					transform: 'scale3d(1.015, 0.995, 1)',
					offset: 0.94,
				},
				{
					opacity: 1,
					transform: 'scale3d(1, 1, 1)',
					offset: 1,
				},
			],
			{
				duration: this.openDuration,
				easing: 'cubic-bezier(0.2, 0.75, 0.25, 1)',
				fill: 'both',
			},
		);

		/*
		 * The first keyframe is already active because fill:'both' is set.
		 * Remove the prep class immediately so the user sees motion on the first
		 * painted frame instead of waiting for a snapshot/capture step.
		 */
		overlayPane.classList.remove('app-dialog-flow-prep');

		await animation.finished.catch(() => undefined);
		animation.cancel();
		surface.style.transformOrigin = '';
	}

	async close(
		overlayPane: HTMLElement,
		origin: AppDialogFlowPoint | null,
	): Promise<void> {
		const surface = this.getSurface(overlayPane);
		if (!surface || this.prefersReducedMotion()) {
			return;
		}

		const rect = surface.getBoundingClientRect();
		const target = origin ?? this.fallbackOrigin(rect);
		this.applyTransformOrigin(surface, rect, target);

		const animation = surface.animate(
			[
				{
					opacity: 1,
					transform: 'scale3d(1, 1, 1)',
				},
				{
					opacity: 1,
					transform: 'scale3d(1.008, 0.994, 1)',
					offset: 0.16,
				},
				{
					opacity: 1,
					transform: 'scale3d(0.72, 0.9, 1)',
					offset: 0.55,
				},
				{
					opacity: 1,
					transform: 'scale3d(0.055, 0.085, 1)',
				},
			],
			{
				duration: this.closeDuration,
				easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
				fill: 'both',
			},
		);

		await animation.finished.catch(() => undefined);
	}

	private getSurface(overlayPane: HTMLElement): HTMLElement | null {
		return overlayPane.querySelector<HTMLElement>(
			'.mat-mdc-dialog-container .mdc-dialog__surface, .mat-mdc-dialog-surface',
		);
	}

	private applyTransformOrigin(
		surface: HTMLElement,
		rect: DOMRect,
		origin: AppDialogFlowPoint,
	): void {
		const localX = origin.x - rect.left;
		const localY = origin.y - rect.top;
		surface.style.transformOrigin = `${localX}px ${localY}px`;
	}

	private fallbackOrigin(rect: DOMRect): AppDialogFlowPoint {
		return {
			x: rect.left + rect.width / 2,
			y: rect.bottom + 24,
		};
	}

	private prefersReducedMotion(): boolean {
		return (
			window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ??
			false
		);
	}
}
