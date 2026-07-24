import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';

export interface Subdistrict {
	subdistrictId: number;
	subdistrictName: string;
	level: number;
}
export interface District {
	districtId: number;
	districtName: string;
	level: number;
	expanded: boolean;
	isLoading: boolean;
	subdistricts: Subdistrict[];
}
export interface City {
	cityId: number;
	cityName: string;
	level: number;
	expanded: boolean;
	isLoading: boolean;
	districts: District[];
}
export interface Province {
	provinceId: number;
	provinceName: string;
	level: number;
	expanded: boolean;
	isLoading: boolean;
	cities: City[];
}

@Injectable({
	providedIn: 'root'
})
export class AreaService {

	constructor(
		private apiService: ApiService
	) { }

	// getProvinces() {

	// }
	// getAreas(): Observable<AreaNode[]> {
	// 	return this.apiService.get(`/backend/common/area`);
	// }

	getProvinces(): Observable<Province[]> {
		return this.apiService.get(`/backend/common/area/province`);
	}

	getCities(provinceId: number) {
		return this.apiService.get(`/backend/common/area/province/${provinceId}/city`);
	}

	getDistricts(provinceId: number, cityId: number) {
		return this.apiService.get(`/backend/common/area/province/${provinceId}/city/${cityId}/district`);
	}

	getSubdistricts(provinceId: number, cityId: number, districtId: number) {
		return this.apiService.get(`/backend/common/area/province/${provinceId}/city/${cityId}/district/${districtId}/subdistrict`);
	}
}
