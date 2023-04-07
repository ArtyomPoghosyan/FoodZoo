import { BehaviorSubject, Subject } from 'rxjs';

import { Injectable } from "@angular/core";
import { AppLocalStorageService } from '../../AppTemplates/services/storages/app-local-storage.service'

@Injectable()
export class AllProductService {

    public getSearchName: string;
    public sortedProductType$:BehaviorSubject<any> = new BehaviorSubject(null)
    public isShowingProductsList$:BehaviorSubject<boolean> = new BehaviorSubject(false)
    public changeData$= new Subject()
    public changeDataId$ = new Subject()
    constructor(
        private localStorage: AppLocalStorageService
    ) {
        this.getSearchName = this.localStorage.getItem("searchName")
    }

    public setSortedType(sortType){
        this.sortedProductType$.next(sortType)
    }

    public getSortedType(){
        return this.sortedProductType$
    }

    public setShowingProductsList(show:boolean){
        this.isShowingProductsList$.next(show)
    }

    public getShowingProductsList(){
        return this.isShowingProductsList$
    }

}


