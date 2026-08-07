import { Menu } from './menu.model';
import { User } from './user.model';

export interface Session {
	user: User;

	accessToken: string;
	refreshToken: string;
	roleCodes?: string[];
	permissionCodes?: string[];
	menus?: Menu[];
}
