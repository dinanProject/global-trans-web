import { Unit } from "./unit/unit";

export interface Project {
	projectId: number;
	projectName: string;
	city?: string;
	remark?: string;
	projectTypeId?: number;
	projectTypeName?: string;
	companyId?: number;
	companyName?: string;
	parentId: number;
	sequence: number;
	siteplanPath?: string;
	launchingDate?: Date;
	formattedLaunchingDate?: string;
	lastModifiedDate?: string;
	lastModifiedUserId?: number;
	lastModifiedUserName?: string;
	units?: Array<Unit>;
}
