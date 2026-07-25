import { User } from './user.model';

export interface Session {
	user: User;
	accessToken: string;
	refreshToken: string;
}
