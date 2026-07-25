import { User } from 'src/app/core/models/user.model';

export interface LoginRequest {
	email: string;
	password: string;
}

export interface LoginResponse {
	accessToken: string;
	refreshToken: string;
	user: User;
}
