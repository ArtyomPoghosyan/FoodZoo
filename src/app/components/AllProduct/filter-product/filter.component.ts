import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { AppSessionStorageService } from "../../../../app/AppTemplates/services/storages/app-session-storage.service";
import { AppLocalStorageService } from "../../../../app/AppTemplates/services/storages/app-local-storage.service";
import { AllProductService } from "../all-product.service";
import { CookieService } from "ngx-cookie";

@Component({
    selector: "app-filter",
    templateUrl: "./filter.component.html",
    styleUrls: ["./filter.component.scss"]
})
export class FilterComponent {

    showFilter: boolean = false;
    public productListype: boolean = false;
    public selectedOrderName: any;
    showButton: boolean = false;
    choosenFilter: any = { id: 0, name: 'Без сортировки', avatar: 'assets/images/sort/default.svg' };
    currentPage: number = 0;
    perPage: number = 40;
    page: any = 0;
    sortString: string = '';
    removeName: boolean = false;
    sortName: any = null;
    filter: any = [];
    productslist: any = [];
    constructor(
        public router: Router,
        public localStorage: AppLocalStorageService,
        public sessionStorage: AppSessionStorageService,
        public allProductService: AllProductService,
        private _cookieService: CookieService,
    ) { }
    orderNames = [
        { id: 0, name: 'Без сортировки', avatar: 'assets/images/sort/default.svg' },
        { id: 'price', name: 'Сначала дешевле', avatar: 'assets/images/sort/low.svg' },
        { id: '-price', name: 'Сначала дороже', avatar: 'assets/images/sort/high.svg' },
        { id: 'action', name: 'Скидка: По убыванию', avatar: 'assets/images/sort/auction.svg' },
        { id: 'name', name: 'По алфавиту', avatar: 'assets/images/sort/abc.png' }
    ];



    public addEl() {

    }

    public removeEl() {

    }

   public changeProductsType(type) {
        this.productListype = type;
        this.allProductService.setShowingProductsList(type)
        this._cookieService.put('isShowingProductsList', type);
    }

    _toggleSidebar() { 

    }

    openMobileSorts() {
        this.showFilter = !this.showFilter;
    }

    public changeSort(event) {
        this.allProductService.setSortedType(event.id)

    }


}