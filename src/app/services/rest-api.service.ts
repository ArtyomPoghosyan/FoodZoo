import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AddBasketRequest, AddBasketResponse } from '../models/Products';
import {map} from 'rxjs/operators';

@Injectable()
export class RestApiService {

	api_url: string = environment.api_url;
	authozization: boolean = false;
	token: string|null = null;
	tokenBearer: string|null = null;

	public get header(): HttpHeaders {
		return new HttpHeaders({
		});	
	}
	// auth headers
	public get headers(): HttpHeaders {
		if (this.tokenBearer) {
			return new HttpHeaders({
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				'Access-Control-Allow-Headers': 'Content-Type',
				'Access-Control-Allow-Origin': '*',
				'Authorization': 'Bearer ' + this.tokenBearer
			});
		} else {
			if (this.token) {
				return new HttpHeaders({
					'Content-Type': 'application/json',
					'Accept': 'application/json',
					'Access-Control-Allow-Headers': 'Content-Type',
					'Access-Control-Allow-Origin': '*',
					'Authorization': 'Bearer ' + this.token
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
	}

	constructor(private httpClient: HttpClient) { }

	private extractData(res: Response) {
		let body = res;
		return body || {};
	}

	getCategories(): Promise<any[]> {
		return this.httpClient.get<any[]>(environment.api_url + '/v2/catalog/categories', { headers: this.header })
			.pipe(map(response => response))
			.toPromise();
	}

	registrationCustomer(email, password?, id?, provider?): Observable<boolean> {
		return this.httpClient.post<boolean>(environment.api_url + '/customers', {
			email: email,
			password: password,
			oAuthId: id,
            socialProvider: provider
		}, { headers: this.header });
	}
	
	confirmCustomerEmail(hash): Observable<Object[]> {
		return this.httpClient.get<Object[]>(environment.api_url + '/customers/verify-email?hash=' + hash, { headers: this.header });
	}

	authorizationUser(email?, password?, id?, provider?): Observable<any> {
		return this.httpClient.post<any>(environment.api_url + '/users/login', {
			email: email,
			password: password,
            oAuthId: id,
            socialProvider: provider
		}, {
				headers: this.headers
			});
	}
    registrationCustomerWithOk(code, redUrl): Observable<any> {
        return this.httpClient.post<any>(environment.api_url + '/customers', {
            code: code,
			redUrl: redUrl
        }, {
            headers: this.headers
        });
    }

	// test forms request
	getUserData(): Observable<any> {
		return this.httpClient.get<any>(environment.api_url + '/users/profile',
			{
				headers: this.headers
			});
	}

	_getUserData(): Observable<any> {
		return this.httpClient.get(environment.api_url + '/v2/users/profile', {headers: this.headers})
	}

	updateUserFullName(firstName): Observable<any> {
		return this.httpClient.post<any>(environment.api_url + '/v2/users/name', {
			value: firstName,
		},
			{
				headers: this.headers
			});
	}
	
	setUserPhone(phone): Observable<any> {
		return this.httpClient.post<any>(environment.api_url + '/users/send-verify-phone-code', {
			phone: phone
		}, {
				headers: this.headers
			});
	}
	setUserPhoneForLocalUser(phone): Observable<any> {
		return this.httpClient.post<any>(environment.api_url + '/users/send-verify-phone-code-local-user', {
			phone: phone
		}, {
			headers: this.headers
		});
	}

	setUserPhoneCode(phone, code): Observable<any> {
		return this.httpClient.put<any>(environment.api_url + '/users/change-phone', {
			phone: phone,
			code: code
		}, {
				headers: this.headers
			});
	}

	updateUserPassword(old_password, new_password): Observable<any> {
		return this.httpClient.put<any>(environment.api_url + '/users/change-password', {
			old_password: old_password,
			new_password: new_password
		},
			{
				headers: this.headers
			});
	}
	remindPassword(email, password): Observable<any> {
		return this.httpClient.post<any>(environment.api_url + '/users/restore-password-request',
			{email: email,
				password:password
			},
			{ headers: this.header });
	}
	// favotites
	addProductFavorites(product_id): Promise<any> {
		return this.httpClient.post<any>(environment.api_url + '/favorites',
			{
				product_id: product_id
			},
			{
				headers: this.headers
			}).toPromise();
	}
	deleteProductFavorites(product_id): Promise<any> {
		return this.httpClient.delete<any>(environment.api_url + '/favorites/' + product_id, {
			headers: this.headers
		}).toPromise();
	}

	/*outlets*/
	getTradePoint(regionId?:number): Observable<Object[]> {
		return this.httpClient.get<Object[]>(environment.api_url + '/v2/users/profile?region_id=1', { headers: this.headers });
	}

	createTradePoint(address, regionId): Observable<Object[]> {
		return this.httpClient.post<Object[]>(environment.api_url + '/v2/users/address', {
			region_id: regionId,
			address: address
		}, { headers: this.headers });
	}

	updateTradePoint(id, address): Observable<Object[]> {
		return this.httpClient.put<Object[]>(environment.api_url + '/v2/users/address', {
			id: id,
			address: address,
		}, { headers: this.headers });
	}

	deleteTradePoint(id): Observable<Object[]> {
		return this.httpClient.delete<Object[]>(environment.api_url + '/v2/users/address?id=' + id, { headers: this.headers });
	}

	regionList(latitude, longitude): Observable<Object[]> {
		let url = 'regions';
		if (latitude) {
			url = url.concat('?latitude=' + latitude);
		}
		if (longitude) {
			url = url.concat('&longitude=' + longitude);
		}
		return this.httpClient.get<Object[]>(environment.api_url + '/v2/addresses/' + url, { headers: this.headers });
	}

	deliveryTimePeriods(): Observable<Object[]> {
		return this.httpClient.get<Object[]>(environment.api_url + '/v2/delivery-time-periods', { headers: this.headers });
	}
	filterAddress(regionId, userAddress): Observable<Object[]> {
		return this.httpClient.get<Object[]>(environment.api_url + '/v2/addresses/filter?region_id=' + regionId + '&user_address=' + userAddress, { headers: this.headers });
	}

	addOrder(recipient_id, delivery_date, comment, time, detect, regionId) {
		return this.httpClient.post<Object[]>(environment.api_url + '/orders', {
			recipient_id: recipient_id,
			delivery_date: delivery_date,
			comment: comment,
            delivery_time_period: time,
			front_type: detect,
            region_id: regionId
		}, { headers: this.headers });
	}
	addOrderWithoutLogin(delivery_address, customer_name, customer_phone, promo, delivery_date, comment, time, items, detect, regionId) {
		return this.httpClient.post<Object[]>(environment.api_url + '/orders', {
			delivery_address: delivery_address,
			customer_name: customer_name,
			customer_phone: customer_phone,
			promocode: promo,
			delivery_date: delivery_date,
			comment: comment,
			delivery_time_period: time,
			items: items,
			front_type: detect,
            region_id: regionId
		}, { headers: this.headers });
	}

	searchAddresses(regionId, pattern): Observable<Object[]> {
		if(pattern){
			let url = '/v3/addresses/search?pattern=';
			return this.httpClient.get<Object[]>(environment.api_url + url + pattern, { headers: this.headers });
		} else {
			return
		}
	}

	yandexGeocoder(longitude, latitude): Observable<Object[]> {
		let url = 'https://geocode-maps.yandex.ru/1.x/?apikey=8c2adf81-83ed-4931-9c72-581d52513a01&format=json&geocode=';
		if (longitude) {
			url = url.concat(longitude + ',');
		}
		if (latitude) {
			url = url.concat(latitude + '&lang=ru_RU');
		} else if(!longitude && !latitude){
			url = url.concat(37.597576 + "," + 55.771899);
		}
		return this.httpClient.get<Object[]>( url, { headers: this.headers });

	}

	getCart() : Observable<any> {
		return this.httpClient.get(environment.api_url + '/v2/cart/global', { headers: this.headers });
	}

	getSeoProperties(seoPageName): Promise<any[]> {
		return this.httpClient.get<any>(environment.api_url + '/v2/seo-properties?name=' + seoPageName, { headers: this.headers }).toPromise();
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

	// cart -------------------------------

	getOrdersTotal() {
		return this.httpClient.get<any>(environment.api_url + '/orders' + '?status=0' + '&' + 'fields=total_new_count', {
			headers: this.headers
		});
	}
	addProductCart(items: []) {
		return this.httpClient.post<any>(environment.api_url + '/carts',
			{
				items: items,
			},
			{
				headers: this.headers
			}).toPromise();
	}
	updateProductCart(product_id, offer_id?, quantity?) {
		if (offer_id === false) {
			return this.httpClient.put<any>(environment.api_url + '/carts/' + product_id,
				{
					quantity: quantity
				},
				{
					headers: this.headers
				}).toPromise();
		} else {
			return this.httpClient.put<any>(environment.api_url + '/carts/' + product_id,
				{
					quantity: quantity,
				},
				{
					headers: this.headers
				}).toPromise();
		}

	}
	deleteProductCart(product_id) {
		return this.httpClient.delete<any>(environment.api_url + '/carts/' + product_id, {
			headers: this.headers
		}).toPromise();
	}
	/////////////////////////

	// orders
	getOrder(order_id): Observable<Object[]> {
		return this.httpClient.get<Object[]>(environment.api_url + '/orders/' + order_id, { headers: this.headers });
	}
	getOrderReasons(): Observable<Object[]> {
		return this.httpClient.get<Object[]>(environment.api_url + '/orders/cancel-statuses', { headers: this.headers });
	}
	setOrder(order_id, body): Observable<Object[]> {
		return this.httpClient.put<Object[]>(environment.api_url + '/orders/' + order_id, body, { headers: this.headers });
	}
	getOrderExel(order_id): Observable<Object[]> {
		return this.httpClient.get<Object[]>(environment.api_url + '/orders/' + order_id + '/get-excel', { headers: this.headers });
	}
	setOrderProblem(order_id, delivery_problem): Observable<Object[]> {
		return this.httpClient.post<Object[]>(environment.api_url + '/orders/' + order_id + '/problem-delivery-inform',
			{
				delivery_problem: delivery_problem
			},
			{ headers: this.headers });
	}
	repeatOrder(order_id): Observable<Object[]> {
		return this.httpClient.post<Object[]>(environment.api_url + '/orders/' + order_id + '/repeat',
			{
			},
			{ headers: this.headers });
	}
	limitOrders(): Observable<Object[]> {
		return this.httpClient.get<Object[]>(environment.api_url + '/configs', { headers: this.headers });
	}

    public getOrdersHistory(page?: number, perPage?: number, createdAtFrom?: string, createdAtTo?: string): Observable<Object[]> {
        let url;
        if (!!createdAtFrom && !!createdAtTo) {
            url = '/orders?page=' + page + '&per-page=' + perPage + '&created_at_from=' + createdAtFrom + '&created_at_to=' + createdAtTo;
        } else if (!!createdAtFrom) {
            url = '/orders?page=' + page + '&per-page=' + perPage + '&created_at_from=' + createdAtFrom;
        } else if (!!createdAtTo) {
            url = '/orders?page=' + page + '&per-page=' + perPage +  '&created_at_to=' + createdAtTo;
        } else {
            url = '/orders?page=' + page + '&per-page=' + perPage;
        }
        return this.httpClient.get<Object[]>(`${environment.api_url}` + url, { headers: this.headers });
    }
	public getNewOrdersHistory(page?: number, perPage?: number): Observable<Object[]> {
		return this.httpClient.get<Object[]>(`${environment.api_url}` + '/orders?status=0' + '&page=' + page + '&per-page=' + perPage, { headers: this.headers })
	}

	public addProductsBasket(body: AddBasketRequest): Observable<AddBasketResponse> {
		return this.httpClient.post<AddBasketResponse>(`${environment.api_url}/cart-items`, body, { headers: this.headers })
	}

	getPromoCode(promoo) {
		let url;
		if (promoo) {
			url = '?promocode=' + promoo;
		}
		return this.httpClient.get<any>(environment.api_url + '/promocode/check' + url, {
			headers: this.headers
		});
	}

	applyPromoCode(promoCode) {
		return this.httpClient.post<any>(environment.api_url + '/promocode/apply', {
			promocode: promoCode
		}, {
			headers: this.headers
		});
	}

	removePromo() {
		return this.httpClient.post<any>(environment.api_url + '/promocode/reset', {
		}, {
			headers: this.headers
		});
	}

	searchUnits(pattern:string): Observable<any> {
		return this.httpClient.get(`${environment.api_url}/v2/catalog/units?pattern=${pattern}`);
	}
}
