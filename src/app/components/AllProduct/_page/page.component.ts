import { Brand } from './../../../AppTemplates/models/brands.model';
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { Router } from "@angular/router";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { AppLocalStorageService } from "../../../../app/AppTemplates/services/storages/app-local-storage.service";
import { ProductsListService } from "../../../../app/services/ProductsList/products-list.service";
import { RestApiService } from "../../../../app/services/rest-api.service";
import { ClosedApiService } from '../../../../app/AppTemplates/services/Portal/closed-api.service';
import { AllProductService } from '../all-product.service';

@Component({
    selector: "app-right-side-filter",
    templateUrl: "./page.component.html",
    styleUrls: ["./page.component.scss"]
})
export class PageComponent implements OnInit {

    public categoryActive: boolean = false;
    public categorieslist: any = [];
    public showButton: boolean = false;
    public brandActive: boolean = false;
    public unitActive: boolean = false;
    public subcategorydActive: boolean = false;
    public openFil: number | null = null;
    public queryParams: any = {};
    public brandslist: any = [];
    public loadNum: number = 10;
    public destroyStream$: Subject<any> = new Subject();
    public filterForm: FormGroup
    public brandsMarkrs: any[] = [];
    public measureList: any[] = [1, 2, 3, 6, 68, 98, 4,];
    public selectedOrderName: any;
    public productListype: boolean = false;
    public searchFilterList=[]
    public searchedUnitList=[]

    orderNames = [
        { id: 0, name: 'Без сортировки', avatar: 'assets/images/sort/default.svg' },
        { id: 'price', name: 'Сначала дешевле', avatar: 'assets/images/sort/low.svg' },
        { id: '-price', name: 'Сначала дороже', avatar: 'assets/images/sort/high.svg' },
        { id: 'action', name: 'Скидка: По убыванию', avatar: 'assets/images/sort/auction.svg' },
        { id: 'name', name: 'По алфавиту', avatar: 'assets/images/sort/abc.png' }
    ];

    constructor(
        public router: Router,
        private restApiService: RestApiService,
        private _productsListService: ProductsListService,
        private _fb: FormBuilder,
        private _restApiService: RestApiService,
        public localStorage: AppLocalStorageService,
        private closedApi: ClosedApiService,
        public allProductService: AllProductService,
    ) { }

    ngOnInit(): void {
        this._formInIt()
        this.restApiService.getCategories().then((resp: any) => {
            this.categorieslist = [...resp?.items]
            this.getBrands()
        })
    }

    private _formInIt() {
        this._fb.group({
            brand: [""]
        })
    }

    public getBrands() {
        let searchName = this.localStorage.getItem("searchName")
        this._productsListService.getFilteredProductsList(searchName)
            .subscribe((resp: any) => {
                this.brandsMarkrs = resp.items.filter((a, i) => resp.items.findIndex((s) => a.brand.name === s.brand.name) === i)
                this.measureList = resp.items.filter((a, i) => resp.items.findIndex((s) => a.brand.name === s.brand.name) === i)
            })
    }

    public brandcategory(brand): void {
        this.allProductService.changeData$.next(brand)
        this.closedApi.reloadBanners.next();

        this.localStorage.setItem("brandId",brand)
        this.router.navigate(['search/brand'])
    }

    public measureUnit(unit): void {
        this.allProductService.changeDataId$.next(unit)
        this.closedApi.reloadBanners.next();
        this.localStorage.setItem("unit",unit)
        this.router.navigate(['search/unit'])
    }

    public getProductsFavorites(): void {
        this.router.navigate(["/search/favorite", { name: "?favorite-products" }])
    }

    public actions(): void {
        this.router.navigate(["/search/action", { name: "action-product" }])
    }

    public new(): void {
        this.router.navigate(["/search/new", { name: "new-product" }])
    }

    returnActiveElement(category) {
        let a = this.router.url;
        let bool: boolean = false;
        if (category.subcats) {
            for (let i = 0; i < category.subcats.length; i++) {
                if (a.indexOf(category.subcats[i].id) !== -1) {
                    bool = true;
                }
            }
        }
        if (a.indexOf(category.slug) !== -1) {
            bool = true
        }
        return bool;
    }

    public openAccordeon(type, category?) {
        switch (type) {
            case 'category':
                this.categoryActive = !this.categoryActive ? true : false;
                break;
            case 'brand':
                this.brandActive = !this.brandActive ? true : false;
                break;
            case 'units':
                this.unitActive = !this.unitActive ? true : false;
                break;
            case 'subcategory':
                this.subcategorydActive = !this.subcategorydActive ? true : false;
                this.categorieslist.forEach(element => {
                    if (element['id'] !== category['id']) {
                        element['opened'] = false;
                    }
                });
                this.openFil = NaN;
                category['opened'] = category['opened'] ? false : true;
                break;
        }
    }

    public returnQuery() {
        let b = {};
        if (this.queryParams['is_new'] == 1) {
            b = Object.assign({ 'is_new': 1 }, b);
        }
        if (this.queryParams['has_discount'] == 1) {
            b = Object.assign({ 'has_discount': 1 }, b);
        }
        if (this.queryParams['is_favorite'] == 1) {
            b = Object.assign({ 'is_favorite': 1 }, b);
        }
        return b
    }

    loadMore(e): any {
        this.loadNum = e + 10;
        if (this.loadNum === this.brandslist.length) {
            this.getNextPageBrands(this.brandslist.length / 20)
        }
    }
    getNextPageBrands(page: number) {
        this._productsListService.updateBrands(page).pipe(
            takeUntil(this.destroyStream$)
        ).subscribe(
            r => {
                if (r.error == 0) {
                    let i = 0;
                    while (i < r.items.length) {
                        this.filterForm.addControl('brand' + r.items[i]['id'], new FormControl(false))
                        this.brandslist.push(r.items[i]);
                        i++
                    }
                }
            }, e => { }
        )
    }

    serchedBrands: any[] = [];
  public returnBrandsBySearch(pattern: string) {
        if (!!pattern) {
            this._productsListService.getBrandByPattern(pattern).pipe(
                takeUntil(this.destroyStream$)
            ).subscribe(
                r => {
                    if (r.error == 0) {
                        this.serchedBrands=r.items
                    }
                }, e => { }
            )
        } else {
            setTimeout(() => {
                this.serchedBrands=[]
            }, 500);
        }      
    }

   public searchUnits(pattern: string) {
        if (!!pattern) {
            this.restApiService.searchUnits(pattern).pipe(
                takeUntil(this.destroyStream$)
            ).subscribe(
                r => {
                    if (r.error == 0) {
                        this.searchedUnitList=r.items
                    }
                }, e => { }
            )
        } else {
            setTimeout(() => {
                this.searchedUnitList=[]
            }, 500);
        }      
    }

    returnFilterFormControlForBrands(id: number): boolean {
        if (this.filterForm.get(`brand${id}`)) {
            return true
        } else {
            return false
        }
    }

    public changeSort(event) {

    }

    public addEl() {

    }

    public removeEl() {

    }

}