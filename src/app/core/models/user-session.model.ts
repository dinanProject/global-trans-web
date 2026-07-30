import { Menu } from './menu.model';
import { User } from './user.model';

export interface UserSessionResponse {
	user: User;
	menus: Menu[];
	roleCodes: string[];
	permissionCodes: string[];
}
