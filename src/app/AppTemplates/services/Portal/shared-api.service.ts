import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SharedApiService {

	api_url : string = environment.api_url

	constructor(
		private http : HttpClient
	) { }

	

  	public yandexGeocoder(longitude, latitude): Observable<any> {
		let url = `https://geocode-maps.yandex.ru/1.x/?apikey=8c2adf81-83ed-4931-9c72-581d52513a01&format=json&geocode=${longitude},${latitude}&lang=ru_RU`;
		return this.http.get<Object[]>( url, {});
	}

  	public getSearchResult(val) : Observable<any> {
		return this.http.get(environment.api_url + '/search?q=' + val, {});
	}

  	public getBanner() : Observable<any> {
		return this.http.get(environment.api_url + '/banners', {});
	}

  	getSeoProperties(seoPageName): Observable<any> {
		return this.http.get(environment.api_url + '/v2/seo-properties?name=' + seoPageName, {});
	}

	public getAllProducts(page, perPage, reqOptions:string): Observable<any> {
		let url = 'page=' + page + '&per_page=' + perPage + reqOptions;
		return this.http.get(environment.api_url + '/v2/catalog/products' + '?' + url, {});
	}

	getCategories(): Observable<any> {
		return this.http.get(environment.api_url + '/v2/catalog/categories', {})
	}

	getAddress(pattern:string) : Observable<string[]> {
		return this.http.get<string[]>(environment.api_url + '/v3/addresses/search?pattern=' + pattern )
	}

	getDeliveryTime() : Observable<any> {
		return this.http.get(environment.api_url + '/v2/delivery-time-periods')
	}

}
