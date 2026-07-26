export interface Menu {
	menuId: number;
	menuName: string;
	parentId: number | null;
	sequence: number;
	code: string;

	route?: string | null;
	icon?: string | null;

	child?: Menu[];
	level?: number;
	visibility?: 'expanded' | 'collapsed' | 'no-child';

	selected?: boolean;
	checked?: boolean;
	index?: number;
}
