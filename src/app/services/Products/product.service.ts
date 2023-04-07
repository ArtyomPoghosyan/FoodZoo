import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AppLocalStorageService } from '../../AppTemplates/services/storages/app-local-storage.service';

@Injectable({
	providedIn: 'root'
})
export class ProductService {

	api_url: string = environment.api_url;
	token: string;
	tokenBearer: string;

	public get headers(): HttpHeaders {
		if (this.localStorage.getItem('UData') && JSON.parse(this.localStorage.getItem('UData')).authToken) {
			return new HttpHeaders({
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				'Access-Control-Allow-Headers': 'Content-Type',
				'Access-Control-Allow-Origin': '*',
				'Authorization': 'Bearer ' + JSON.parse(this.localStorage.getItem('UData')).authToken
			});
		} else {
			return new HttpHeaders({
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				'Access-Control-Allow-Headers': 'Content-Type',
				'Access-Control-Allow-Origin': '*'
			});
		}
	}
	
	constructor(
		private httpClient: HttpClient,
		private localStorage: AppLocalStorageService
	) { }

	// get product
	getProduct(slugOrId): Promise<any[]> {
		if (!isNaN(slugOrId)) {
			return this.httpClient.get<any[]>(environment.api_url + '/v2/catalog/product/id?id=' + slugOrId, { headers: this.headers }).toPromise();
		} else {
			return this.httpClient.get<any[]>(environment.api_url + '/v2/catalog/product/slug?slug=' + slugOrId, { headers: this.headers }).toPromise();
		}

	}

	setAuthorizationToken(token) {
		this.token = token;
		delete this.tokenBearer;
	}
	setAuthorizationTokenBearer(token) {
		this.tokenBearer = token;
		delete this.token;
	}
	deleteAuthorizationToken() {
		delete this.tokenBearer;
		delete this.token;
	}
}
