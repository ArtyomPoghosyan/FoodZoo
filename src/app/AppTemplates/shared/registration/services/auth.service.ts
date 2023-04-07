import { HttpClient, HttpHeaders } from "@angular/common/http";
import { EventEmitter, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AppLocalStorageService } from "../../../../AppTemplates/services/storages/app-local-storage.service";
import { environment } from "../../../../../environments/environment";



@Injectable({providedIn: 'root'}) export class AuthentificatedService {

    cartUpdate: EventEmitter<boolean> = new EventEmitter();
    goToOrder: EventEmitter<boolean> = new EventEmitter();
    updateProfile : EventEmitter<boolean> = new EventEmitter();
    confirmValue: string = '';

    constructor(
        private http: HttpClient,
        private localStorage: AppLocalStorageService
    ){}
    
    returnToken() : string|undefined {
        if(this.localStorage.getItem('UData') && JSON.parse(this.localStorage.getItem('UData')).authToken){
            return JSON.parse(this.localStorage.getItem('UData')).authToken
        } else {
            return
        }
    }

    public headers(): HttpHeaders {
        if(this.returnToken()){
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


    public sendTokenToPhone(phone){
        if(this.returnToken()){
            return this.http.post(`${environment.api_url}/v3/users/send-code/phone`,phone,{ headers: this.headers() } )
            
        } else {
            return this.http.post(`${environment.api_url}/v3/users/send-code/phone`,phone)
            // return this.http.post(`${environment.api_url}/v3/users/send-code/phone`,phone )
            // return this.http.post(url, {dest: params.value})
        }
    }

    public sendTokenToEmail(email){ 
        // return this.http.post(`${environment.api_url}/v3/users/send-code/email`,email,{ headers: this.headers() })
        if(this.returnToken()){
            return this.http.post(`${environment.api_url}/v3/users/send-code/email`,email,{ headers: this.headers() } )
            
        } else {
            return this.http.post(`${environment.api_url}/v3/users/send-code/email`,email)
            // return this.http.post(`${environment.api_url}/v3/users/send-code/phone`,phone )
            // return this.http.post(url, {dest: params.value})
        }
    }

    sendCode(params:{type:string, value:string}) : Observable<any>{
        let url = environment.api_url + ("/v2/users/send-code/" + params.type);
        if(this.returnToken()){
            return this.http.post(url, {dest: params.value}, {headers: this.headers()})
        } else {
            return this.http.post(url, {dest: params.value})
        }
    }

    codeVerificate(type:string, value:string, code:string) : Observable<AuthResponse | null> {
        let push_token = "undefined";
        let url = environment.api_url + `/v2/users/${type}`;
        if(this.returnToken()){
            return this.http.post<AuthResponse>(url, {value, code, push_token}, {headers:this.headers()})
        } else {
            return this.http.post<AuthResponse>(url, {value, code, push_token})
        }
    }

    skipAuth(user_id?:number) : Observable<any> {
        let url = environment.api_url + '/v2/users/create';
        let push_token = "undefined";
        if(this.returnToken()){
            return this.http.post<AuthResponse>(url, {user_id, push_token}, {headers:this.headers()});
        } else {
            return this.http.post<AuthResponse>(url, {user_id, push_token});
        }
    }

}

export interface AuthResponse {
    authToken?: string;
    userId?: string;
    profile?: UserProfile;
}

export interface UserProfile{
    id: number;
    email: string | null;
    phone: string | null;
    name: string | null;
    cartAmount: number;
    isEmailEnabled: number;
    isPushEnabled: number;
    isRecallEnabled: number;
    position: GeoPosition;
    regionName: string;
    shownAddress: string;
    storeChoice: number;
};

export interface GeoPosition {
    latitude: number;
    longitude: number;
};
