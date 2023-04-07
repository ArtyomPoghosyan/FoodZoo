import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { environment } from "../../../../environments/environment";
import { Product } from "../../models/product.model";
import { AppLocalStorageService } from "../storages/app-local-storage.service";

@Injectable({ providedIn: "root" })
export class ClosedApiService {

    api_url: string = environment.api_url;
    canGatByToken: boolean = false;
    public reloadBanners = new Subject();
    constructor(
        private http: HttpClient,
        private localStorage: AppLocalStorageService
    ) { }

    public headers(): HttpHeaders {
        if (this.canGatByToken && this.localStorage.getItem('UData') && JSON.parse(this.localStorage.getItem('UData')).authToken) {
            return new HttpHeaders({
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Authorization': 'Bearer ' + JSON.parse(this.localStorage.getItem('UData')).authToken
            })
        } else {
            return new HttpHeaders({
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*'
            });
        }
    }

    returnForCheckAuth(): HttpHeaders {
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
    // PROFILE ACTIONS
    // получение профиля
    getUserData(): Observable<any> {
        return this.http.get(this.api_url + '/v2/users/profile', { headers: this.returnForCheckAuth() })
    }
    // отправка кода подтверждения телефона/е-мейла
    sendCode(params: { type: string, value: string }) {
        let url = this.api_url + ("/v2/users/send-code/" + params.type);
        return this.http.post(url, { dest: params.value }, { headers: this.headers() })
    }
    // установка номера телефона/е-мейла в профиле
    codeVerificate(type: string, value: string, code: string): Observable<any> {
        let push_token = "undefined";
        let url = this.api_url + `/v2/users/${type}`;
        return this.http.post(url, { value, code, push_token }, { headers: this.headers() })
    }
    // изменеие имени пользователя
    cnageName(value: string): Observable<any> {
        return this.http.post(this.api_url + '/v2/users/name', { value }, { headers: this.headers() })
    }
    // изменение статуса перезвона после оформления заказа
    changeRecallStatus(value: number): Observable<any> {
        return this.http.post(this.api_url + '/v2/users/is-recall-enabled', { value }, { headers: this.headers() })
    }
    // изменение статуса получения Push уведомлений (неактивно (в разработке))
    changePushMessagesStatus(value: number): Observable<any> {
        return this.http.post(this.api_url + '/v2/users/is-push-enabled', { value }, { headers: this.headers() })
    }
    // изменение статуса получения Е-мейл рассылки
    changeMailSenderStatus(value: number): Observable<any> {
        return this.http.post(this.api_url + '/v2/users/is-email-enabled', { value }, { headers: this.headers() })
    }
    // изменение адреса доставки пользователя
    setDeliveryAddress(value: string): Observable<any> {
        return this.http.post(this.api_url + '/v2/users/delivery-address', { value }, { headers: this.headers() })
    }
    // CART ACTIONS
    // Получение списка продуктов
    public getAllProducts(page, perPage, reqOptions: string): Observable<any> {
        let url = 'page=' + page + '&per_page=' + perPage + reqOptions;
        return this.http.get(this.api_url + '/v2/catalog/products' + '?' + url, { headers: this.headers() });
    }
    // получение общего количества товаров в корзине (уже не рабочий - берется из профиля параметр : "cartAmount" )
    getCartTotal(): Observable<any> {
        return this.http.get<any>(this.api_url + '/v2/cart/total-amount', {
            headers: this.headers()
        });
    }
    // добавление товара в корзину
    addItemToCart(product_id: number, quantity: number): Observable<any> {
        return this.http.post(this.api_url + '/v2/cart/add', { product_id, quantity }, { headers: this.headers() })
    }
    // обновление количества товара в корзине
    updateProductCount(product_id: number, quantity: number, inc: boolean): Observable<any> {
        return this.http.put(this.api_url + '/v2/cart/update', { product_id, quantity }, { headers: this.headers() })
    }
    // получение корзины
    getCart(): Observable<any> {
        return this.http.get(this.api_url + '/v2/cart/global', { headers: this.headers() })
    }
    // удаление продукта из корзины
    deleteProductCart(product_id): Observable<any> {
        return this.http.delete(this.api_url + '/v2/cart/delete?product_id=' + product_id, {
            headers: this.headers()
        })
    }
    // отправка заказа (оформление заказа)
    order(delivery_date: string, delivery_time_period: number, front_type: number, comment?: string): Observable<any> {
        return this.http.post(this.api_url + '/v2/order/global', { delivery_date, delivery_time_period, comment, front_type }, { headers: this.headers() })
    }
    // дабвить/удалить промокод
    setPromocode(promocode: string): Observable<any> {
        return this.http.post(this.api_url + '/v2/cart/promocode', { promocode }, { headers: this.headers() })
    }
    // очистить корзину
    clearCart(): Observable<any> {
        return this.http.delete(this.api_url + '/v2/cart/clear', { headers: this.headers() })
    }
    // добавить товар в избранное
    addProductToFavorites(id: number): Observable<any> {
        return this.http.post(this.api_url + `/v2/catalog/favorite`, { product_id: id }, { headers: this.headers() })
    }
    // удалить товар из избраного
    deleteProductFromFavorites(id: number): Observable<any> {
        return this.http.delete(this.api_url + `/v2/catalog/favorite?product_id=${id}`, { headers: this.headers() })
    }
    // получения расписания работы складов
    getSheulder(): Observable<any> {
        return this.http.get(this.api_url + '/v2/orders/delivery-schedule', { headers: this.headers() })
    }
    // миграция корзины с временного пользователя к авторизованному
    cartMigrate(products: cartMigrateParams): Observable<any> {
        return this.http.post(this.api_url + '/v2/cart/migrate', { products }, { headers: this.headers() });
    }

    // Получение истории заказов
    getOrdersHistory(params: getOrdersHistoryParams): Observable<orderHistoryElement | any> {
        let payload = `?page=${params.page ? params.page : 0}&per_page=${params.per_page ? params.per_page : 10}`;
        if (params.is_closed !== undefined) {
            payload = `${payload}&is_closed=${params.is_closed}`;
        }
        if (!!params.from_date) {
            payload = `${payload}&from_date=${params.from_date}`;
        }
        if (!!params.to_date) {
            payload = `${payload}&to_date=${params.to_date}`;
        }
        return this.http.get(`${this.api_url}/v2/order/orders${payload}`, { headers: this.headers() })
    }

    // Отмена заказа
    orderCancel(id: number): Observable<{ error: number, message: string } | any> {
        return this.http.post(`${this.api_url}/v2/order/cancel`, { id }, { headers: this.headers() })
    }

    getOrderHistoryItemItems(id: number): Observable<orderHistoryElementProducts | any> {
        return this.http.get(`${this.api_url}/v2/order/order-items?id=${id}`, { headers: this.headers() })
    }

    public setLocation(body: any) {

        return this.http.post(`${this.api_url}/v3/users/address `, body, { headers: this.headers() })
    }

    public sendWidgetToken(body) {
        return this.http.post(`${this.api_url}/v3/check-hcaptcha`, body, { headers: this.headers() })
    }

    public sendTokenToPhone(phone) {

        return this.http.post(`${this.api_url}/v3/users/send-code/phone`, phone, { headers: this.headers() })
    }

    public sendTokenToEmail(email) {
        return this.http.post(`${this.api_url}/v3/users/send-code/email`, email, { headers: this.headers() })
    }
}

export interface getOrdersHistoryParams {
    is_closed?: number,
    from_date?: string,
    to_date?: string,
    per_page?: number,
    page?: number
}

export interface orderHistoryElement {
    error: number,
    items: ordersHystoryItem[],
    message: string,
    pagination: {
        currItemsCount: number,
        currPage: number,
        perPage: number,
        totalItemsCount: number,
        totalPageCount: number
    }
}

export interface orderHistoryElementProducts {
    error: number,
    items: ordersHystoryProduct[],
    message: string,
    pagination: {
        currItemsCount: number,
        currPage: number,
        perPage: number,
        totalItemsCount: number,
        totalPageCount: number
    }
}

export interface ordersHystoryProduct {
    price: number,
    product: Product,
    quantity: number,
    unitSize: number
}

export interface ordersHystoryItem {
    deliveryAddress: string
    deliveryTime: string
    id: number
    isCancelEnabled: number
    status: string
    statusTime: string
    sum: number
}

export interface cartMigrateParams {
    id: number,
    quantity: number
}