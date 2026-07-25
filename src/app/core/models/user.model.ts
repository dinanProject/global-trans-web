export interface User {
	id: number;
	uuid: string;

	companyId: number;
	divisionId?: number | null;
	departmentId?: number | null;

	email: string;
	fullName: string;
	phone?: string | null;

	isActive: boolean;

	lastLoginAt?: string | null;
	createdAt?: string;
	updatedAt?: string;
	deletedAt?: string | null;
}
