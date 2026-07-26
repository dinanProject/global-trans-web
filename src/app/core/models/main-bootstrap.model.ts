import { Menu } from './menu.model';
import { User } from './user.model';

export interface MainBootstrapResponse {
	user: User;
	menus: Menu[];
}
