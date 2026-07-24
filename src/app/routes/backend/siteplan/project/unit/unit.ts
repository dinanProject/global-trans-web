export interface Unit {
	unitId: number;
	projectId: number;
	projectName: string;
	companyId?: number;
	companyName?: string;
	unitCategoryId?: number;
	unitCategoryName?: string;
	unitTypeId?: number;
	unitTypeName?: string;
	unitName: string;
	blockName?: string;
	unitNo?: string;
	lt?: number;
	lb?: number;
	salesStatusId?: number;
	salesStatusName?: string;
	progressStatusId?: number;
	progressStatusName?: string;
	picX?: number;
	picY?: number;
	isShowUnit?: boolean;
	isOpen?: boolean;
	lastModifiedDate?: string;
	lastModifiedUser?: string;
	mapped?: boolean;

	tunaiKeras: number;
	tunaiBertahap: number;
	kpr: number;

	fullName?: string;
	agentName?: string;
	leadAgentName: string;
	salesDate?: Date;
	paymentMethodId?: number;
	salesPrice?: number;
	remark?: string;

	formattedSalesStatusName?: string;
	formattedProgressStatusName?: string;
	formattedUnitCategoryName?: string;
}
