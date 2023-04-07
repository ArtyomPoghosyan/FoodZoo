import { BehaviorSubject } from 'rxjs';
import { Injectable } from "@angular/core";


@Injectable({providedIn:"root"}) 
export class ProfileHelper{

    public AddressState:BehaviorSubject<any>= new BehaviorSubject(null)
    public coordinateState:BehaviorSubject<any> = new BehaviorSubject(null)
    constructor(){
        console.log(this.AddressState,"this.AddressInfoooooo")
    }

    mergeUserData(localStorageUserData, ApiUserData){
        
    }

}