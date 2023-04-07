import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { Products } from '../../models/Products';
import { environment } from '../../../environments/environment';
import { AppSessionStorageService } from '../../AppTemplates/services/storages/app-session-storage.service';
import { AppLocalStorageService } from '../../AppTemplates/services/storages/app-local-storage.service';

@Injectable({
	providedIn: 'root'
})
export class ProductsListService {

	

	public filteredProductList = []
	public filteredProduct=[]
	public reloadProduct:BehaviorSubject<string> = new BehaviorSubject("");

	api_url: string = environment.api_url;
	token: string;
	tokenBearer: string;
	public get headers(): HttpHeaders {
		if (this.returnToken()) {
			return new HttpHeaders({
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				'Access-Control-Allow-Headers': 'Content-Type',
				'Access-Control-Allow-Origin': '*',
				'Authorization': 'Bearer ' + this.returnToken()
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

	public returnToken(){
		if(this.localStorage.getItem('UData') && JSON.parse(this.localStorage.getItem('UData')).authToken){
			return JSON.parse(this.localStorage.getItem('UData')).authToken;
		} else {
			return
		}
	}

	constructor(private httpClient: HttpClient,
				public sessionStorage: AppSessionStorageService,
				public localStorage: AppLocalStorageService) { }

	ngOnInit() {

	}

	// get products

	public getProductsMark(id){
		return this.httpClient.get(`${environment.api_url}/v2/catalog/products/filter?brand_ids[]=${id}`,{ headers: this.headers })
	}

	public getProductUnit(unit){		
		return this.httpClient.get(`${environment.api_url}/v2/catalog/products/filter?units[]=${unit}`,{ headers: this.headers })
	}

	public getFilteredProductsList(searchName?:string){
		if(searchName){			
			return this.httpClient.get(`${environment.api_url}/v2/catalog/products?pattern=${searchName}&page=0&per_page=50`, { headers: this.headers })
		}
		else{
			let searchItem= this.localStorage.getItem('searchName')
			searchItem = JSON.parse(searchItem);
			return this.httpClient.get(`${environment.api_url}/v2/catalog/products?pattern=${searchItem}&page=0&per_page=50`, { headers: this.headers })
		}
	}

	public getProducts(page, region): Observable<Products[]> {
		return this.httpClient.get<Products[]>(environment.api_url + '/products' + '?' + 'region_id=' + region + '&' + 'page=' + page, { headers: this.headers });
	}
	public getAllProducts(page, perPage, idCategory?, has_discount?, filter?, search?, is_favorite?, id?, weight?, is_new?): Promise<Products[]> {
		let url = 'page=' + page + '&per_page=' + perPage;	
		const brId = this.localStorage.getItem('brId');		
		if(this.sessionStorage.getItem('prevUrl').split('/')[1] === 'category'){
			url = url.concat('&type=category&slug=' + idCategory);
		} else if(this.sessionStorage.getItem('prevUrl').split('/')[1] === 'brand'){
			url = url.concat('&type=brand&slug=' + idCategory);
		}
	// 	if (this.sessionStorage.getItem('prevUrl')) {	
	// 		if (this.sessionStorage.getItem('prevUrl').split('/')[1] === 'brand' && brId) {
	// 		   if (idCategory) {
	// 			   url = url.concat('&type=brand&slug=' + idCategory);
	// 		   }
	// 	   } else if (this.sessionStorage.getItem('prevUrl') === '/category'
	// 		   || this.sessionStorage.getItem('prevUrl') === '/' || this.sessionStorage.getItem('prevUrl').split('/')[1] === 'product') {
	// 		   if (idCategory) {
	// 			   url = url.concat('&type=category&slug=' + idCategory);
	// 		   }
	// 	   }
	// 	   else { 		     
	// 			if (idCategory) {				
	// 				url = url.concat('&type=brand&slug=' + idCategory);
	// 			}
	// 		}
	//    } else {   
	// 	   if (idCategory) {
	// 		   url = url.concat('&slug=' + idCategory);
	// 	   }
	//    }
		if (has_discount === 'skidki') {
			url = url.concat('&type=special&slug=' + has_discount);
		} else if (has_discount) {
			url = url.concat('&has_discount=1');
        }
		if (filter) {
			url = url.concat(filter);
		}
		if (search) {
			url = url.concat('&pattern=' + search);
		}
		if (is_favorite) {
			url = url.concat('&is_favorite=1');
		}
		if (id) {
			url = url.concat('&id=' + id);
		}
		if (weight) {
			url = url.concat('&weight=' + weight);
		}
		if (is_new === 'novinki') {
			url = url.concat('&type=special&slug=' + is_new);
		} else if (is_new) {
			url = url.concat('&is_new=1');
		}
		/*if (typeof idCategory === 'string' || typeof has_discount === 'string' || typeof is_new === 'string') {
			if (has_discount === 'skidki' || is_new === 'novinki'  || +idCategory.search('category_ids') < 0) {
				return this.httpClient.get<Products[]>(
					environment.api_url + '/v2/catalog/products/slug' + '?' + url, { headers: this.headers }
				).toPromise();
			}
		}*/
		return this.httpClient.get<Products[]>(
			environment.api_url + '/v2/catalog/products' + '?' + url, { headers: this.headers }
		).toPromise();
	}
	public getLocalProducts(ids, promocode): Promise<Products[]> {
		let url = '';
		if (ids) {
			url = url.concat(ids);
		}
		if (promocode) {
			url = url.concat('&promocode=' + promocode);
		}
		return this.httpClient.get<Products[]>(
			environment.api_url + '/v2/cart/local' + '?' + url, { headers: this.headers }
		).toPromise();
	}

	public getAllNewProducts(page, perPage, is_new): Promise<Products[]> {
		let url = 'page=' + page + '&per-page=' + perPage;
		if (is_new) {
			url = url.concat('&is_new=' + is_new);
		}
		return this.httpClient.get<Products[]>(
			environment.api_url + '/v2/catalog/products' + '?' + url, { headers: this.headers }
		).toPromise();
	}

	public getSearchResult(val) {
		return this.httpClient.get<Products[]>(
			environment.api_url + '/search?q=' + val, { headers: this.headers }
		);
	}

	/**
	 * searchProduct
	 */

	public getBrandsAll(catId?: [] | number[]): Promise<Products[]> {
		let url = '/v2/catalog/brands';
		if (catId.length) {
			url = url.concat('?category_ids[]=' + catId.toString());
		}
		return this.httpClient.get<Products[]>(environment.api_url + url, { headers: this.headers }).toPromise();
	}
	public getBrands(page): Promise<Products[]> {
		return this.httpClient.get<Products[]>(environment.api_url + '/brands' + '?' + 'page=' + page, { headers: this.headers }).toPromise();
	}

	public updateBrands(page) : Observable<any> {
		return this.httpClient.get(`${environment.api_url}/v2/catalog/brands?page=${page}`)
	}

	public getBrandByPattern(pattern:string) : Observable<any> {
		return this.httpClient.get(`${environment.api_url}/v2/catalog/brands?pattern=${pattern}`);
	}
	
	public getUnitsAll(catId?: [], brandId?: []): Promise<Products[]> {
		let url = '/v2/catalog/units';
		if (catId.length) {
			url = url.concat('?category_ids[]=' + catId.toString());
			if (brandId.length) {
				url = url.concat('&brand_ids[]=' + brandId.toString());
			}
		} else {
			if (brandId.length) {
				url = url.concat('?brand_ids[]=' + brandId.toString());
			}
		}
		return this.httpClient.get<Products[]>(environment.api_url + url, { headers: this.headers }).toPromise();
	}

	// get banner
	getBanner() {
		return this.httpClient.get<any>(environment.api_url + '/banners', {
			headers: this.headers
		}).toPromise();
	}


	// ----------------------------------------------
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


	addItemToCart(product_id: number, quantity: number): Observable<any> {
        return this.httpClient.post(environment.api_url + '/v2/cart/add', { product_id, quantity })
    }
}
