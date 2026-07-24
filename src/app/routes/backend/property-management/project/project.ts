export interface Project {
	projectId: number;
	projectName: string;
	city: string;
	remark: string;
	projectTypeId: number;
	projectTypeName: string;
	companyId: number;
	companyName: string;
	siteplanPath: string;
	launchingDate: Date;
	formattedLaunchingDate: string;
	lastModifiedDate: string;
	lastModifiedUser: string;
}
