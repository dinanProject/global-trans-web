import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type AppTheme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
	private static readonly STORAGE_KEY = 'global-trans-theme';
	private currentTheme: AppTheme = 'light';
	private readonly themeSubject = new BehaviorSubject<AppTheme>('light');
	readonly theme$ = this.themeSubject.asObservable();

	constructor(@Inject(DOCUMENT) private readonly document: Document) {
		this.currentTheme = this.readStoredTheme();
		this.applyTheme(this.currentTheme);
		this.themeSubject.next(this.currentTheme);
	}

	getTheme(): AppTheme {
		return this.currentTheme;
	}

	isDarkTheme(): boolean {
		return this.currentTheme === 'dark';
	}

	toggleTheme(): void {
		this.setTheme(this.isDarkTheme() ? 'light' : 'dark');
	}

	setTheme(theme: AppTheme): void {
		this.currentTheme = theme;
		this.applyTheme(theme);
		this.themeSubject.next(theme);

		try {
			localStorage.setItem(ThemeService.STORAGE_KEY, theme);
		} catch {
			// Theme preference is presentation-only; storage failure must not affect app flow.
		}
	}

	private readStoredTheme(): AppTheme {
		try {
			return localStorage.getItem(ThemeService.STORAGE_KEY) === 'dark'
				? 'dark'
				: 'light';
		} catch {
			return 'light';
		}
	}

	private applyTheme(theme: AppTheme): void {
		this.document.documentElement.setAttribute('data-theme', theme);
	}
}
