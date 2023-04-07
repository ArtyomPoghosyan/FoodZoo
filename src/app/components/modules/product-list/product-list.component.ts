import {Component, HostListener, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {UtilitesService} from '../../../services/utilites.service';
import {ProductsListService} from '../../../services/ProductsList/products-list.service';
import {RestApiService} from '../../../services/rest-api.service';
import {ActivatedRoute, Router} from '@angular/router';
import {FormControl, FormGroup} from '@angular/forms';
import {CookieService} from 'ngx-cookie';
import {browserRefresh} from '../../../app.component';
import {Subject } from 'rxjs';
import {Location} from '@angular/common';
import {Meta, Title} from '@angular/platform-browser';
import { takeUntil } from 'rxjs/operators';
import { AppLocalStorageService } from '../../../AppTemplates/services/storages/app-local-storage.service';
import { AppSessionStorageService } from '../../../AppTemplates/services/storages/app-session-storage.service';
import { HelperServiceService } from '../../../AppTemplates/services/helpers/helper-service.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorsService, Error, ERRORSTYPES } from '../../../AppTemplates/shared/errors/service/errors.service';

@Component({
    selector: 'app-product-list',
    templateUrl: './product-list.component.html',
    styleUrls: ['./product-list.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ProductListComponent implements OnInit, OnDestroy {
    userData: any = null;
    userCustomer:boolean = true;
    auth_token: string|null = null;
    categoryActive: boolean = false;
    brandActive:boolean = false;
    unitActive:boolean = false;
    subcategorydActive: boolean = false;
    is_favorite: boolean = false;
    productListype: boolean = false;
    productslist: any = [];
    brandslist: any = [];
    cutBrand: any = [];
    unitlist: any = [];
    categorieslist: any = [];
    categorieslistBySearch: any = [];
    brandListBySearch: any = [];
    subCatIds: any = [];
    idArr: any = [];
    subCatChooseIds: any = [];
    patchCats: any = [];
    isLoading:boolean = true;
    num:number = 1;
    getProductLoading:boolean = false;
    auth:boolean = false;
    categoriesNone: boolean = false;
    idcatBool: boolean = false;
    idcatBool2: boolean = false;
    allpage: number|null = null;
    page: any = 0;
    currentPage:number = 0;
    has_discount: any = null;
    hasNew: any = null;
    perPage:number = 40;
    idCatalog: number|null = null;
    idCategory: any = null;
    subCatSlug: any = null;
    hasParentActive: number|null = null;
    hasChildActive: number|null = null;
    isMainCategory:boolean = false;
    isSearchString:boolean = false;
    filterOpened: boolean = false;
    filter: any = [];
    productData: any = [];
    sortString:string = '';
    sortName: any = null;
    searchString:string = '';
    searchWord:string = '';
    countFilter:number = 0;
    filterParams: any = {};
    queryParams: any = {};
    downloadStep: number|null = null;
    noDownladMore: boolean = false;
    downladMore:boolean = true;
    categoryExist: boolean = false;
    tooltipmessage:string = '';
    errorMsg: string|null = null;
    addCartProductId: number|null = null;
    filterForm:FormGroup = new FormGroup({});
    minOrderAmount: number|null = null;
    batchSize: number|null = null;
    searchText: string|null = null;
    searchUnit: string|null = null;
    selectedOrderName
    currentProd: any = null;
    removeName: boolean = false;
    loadNum:number = 10;
    loadunit:number = 10;
    leftClass: boolean = false;
    check:boolean = true;
    nextStep:boolean = false;
    nextStepBr:boolean = false;
    browserRefresh: boolean = false;
    elName: string|null = null;
    tenTagName: any = null;
    tId: any = [];
    totalCount: number|null = null;
    minWeight: any = null;
    maxWeight: any = null;
    weight: any = null;
    weightName: any = null;
    showBrandBlock: boolean = false;
    previousTarget: any = [];
    showButton: boolean = false;
    mobileImg: boolean = false;
    filterButton:boolean = true;
    catBold:boolean = true;
    _opened: boolean = false;
    openFil: number|null = null;
    resFilterBrand:boolean = true;
    resFilterUnit:boolean = true;
    resFilterCategory:boolean = true;
    filterSubCatSlug: any = [];
    lastScrollTop:number = 0;
    subCatId:number = 0;
    is_new: boolean = false;
    prevUrl: any = [];
    hasCensoredCat: boolean = false;
    hasCensoredProd: boolean = false;
    status: boolean = false;
    preLoadProd: boolean = false;
    stopUrl: any = null;
    goNext: boolean = true;
    goNextTo: boolean = true;
    brSlug: any = null;
    otherSubCatChooseIds: any = [];

    orderNames = [
        {id: 0, name: 'Без сортировки', avatar: 'assets/images/sort/default.svg'},
        {id: 'price', name: 'Сначала дешевле', avatar: 'assets/images/sort/low.svg'},
        {id: '-price', name: 'Сначала дороже', avatar: 'assets/images/sort/high.svg'},
        {id: 'action', name: 'Скидка: По убыванию', avatar: 'assets/images/sort/auction.svg'},
        {id: 'name', name: 'По алфавиту', avatar: 'assets/images/sort/abc.png'}
    ];

    showFilter:boolean = false;
    seoH1: string|null = null;
    seoText: string|null = null;
    choosenFilter: any =  {id: 0, name: 'Без сортировки', avatar: 'assets/images/sort/default.svg'};
    destroyStream$: Subject<any> = new Subject();
    srcBrand: string = "";
    constructor(
        // NEW
        private errorsService: ErrorsService,
        public localStorage: AppLocalStorageService,
        public sessionStorage: AppSessionStorageService,
        public helperService: HelperServiceService,
        // OLD
        private utilitiesService: UtilitesService,
        public rest: RestApiService,
        public product_list_rest: ProductsListService,
        public router: Router,
        private route: ActivatedRoute,
        private _cookieService: CookieService,
        public cookie: CookieService,
        public location: Location,
        private titleService: Title,
        private metaService: Meta,
    ) {}

    ngOnInit() {      
        this.stopUrl = this.router.url;

        this.router.routeReuseStrategy.shouldReuseRoute = () => {
            return false;
          }

        window.innerWidth <= 1206 ? this.showButton = true : this.showButton = false;

        window.innerWidth <= 420 ? this.mobileImg = true : this.mobileImg = false;

        window.innerWidth <= 710 ? this.is_new = true : this.is_new = false;

        this.browserRefresh = browserRefresh;

        this.weight = '';
        if (this.browserRefresh) {
            this.localStorage.removeItem('currentPage');
            this.localStorage.removeItem('hash');
        }
        this.downloadStep = 1;
        this.setAllStates();
        this.checkAuthorization();

        this.route.params.pipe(
            takeUntil(this.destroyStream$)
        ).subscribe( params => {
            params.msg === 'false' ? this.filterButton = false : this.filterButton = true;
            this.countFilter = 0;
            this.sortString = '';
            this.subCatIds = [];
            this.subCatChooseIds = [];
            this.otherSubCatChooseIds = [];
            this.filterForm.reset();
            this.filter = [];
            this.brandslist = [];
            this.unitlist = [];
            this.productslist = [];
            this.page = 0;
            this.noDownladMore = false;
            this.idCategory = this.route.snapshot.paramMap.get('idcat');
            this.subCatSlug = this.route.snapshot.paramMap.get('subSlug');
            this.brSlug = this.route.snapshot.paramMap.get('brSlug');
            if (this.brSlug) {
                this.idCategory = this.brSlug;
            }
            if (this.subCatSlug) {
                this.idCategory = this.subCatSlug;
            }
            if (this.idCategory) {
                this.countFilter++;
                this.categoryActive = true;
            }
            if (this.subCatSlug) {
                this.filterSubCatSlug.push({id: this.subCatSlug, name: 'subSlug'});
                this.idCategory = this.subCatSlug;
            }
            if (this.localStorage.getItem('catId')) {
                this.subCatId = Number(this.localStorage.getItem('catId'));
            }
            this.searchString = this.route.snapshot.queryParamMap.get('pattern') ? this.route.snapshot.queryParamMap.get('pattern') : '';
            this.isSearchString = !!this.route.snapshot.queryParamMap.get('pattern');
            this.is_favorite = +this.route.snapshot.queryParamMap.get('is_favorite') === 1;
            this.has_discount = +this.route.snapshot.queryParamMap.get('has_discount') === 1;
            this.hasNew = +this.route.snapshot.queryParamMap.get('is_new') === 1;
            this.sortName = this.route.snapshot.queryParamMap.get('sort') ? '&sort=' + this.route.snapshot.queryParamMap.get('sort') : '';
            if (this.sortName) {
                sessionStorage.setItem('sort', this.sortName);
            }
            this.filterParams = this.route.snapshot.queryParamMap;
            const specProd = this.route.snapshot.paramMap.get('specProd');
            if (specProd === 'skidki') {
                this.has_discount = specProd;
            } else  if (specProd === 'novinki') {
                this.hasNew = specProd;
            }
            for (let [key, value] of Object.entries(this.filterParams.params)) {
                if (key !== 'pattern' && key !== 'has_discount' && key !== 'is_new' && key !== 'is_favorite' && key !== 'sort') {
                    if (key.split('[')[0] === 'category_ids') {
                        this.otherSubCatChooseIds.push(Number(value));
                    }
                    this.filter.push({id: value, name: key});
                }
            }
            if (this.has_discount) {
                this.countFilter++;
            }
            if (this.hasNew) {
                this.countFilter++;
            }

            if (this.is_favorite) {
                this.countFilter++;
            }

            if (this.filter.length > 0) {
                this.countFilter = this.countFilter + this.filter.length;
                this.updateFilterArray(this.filter);
            }
            this.checkAllParams();
            this.typeRequestApi();
            if (this.brSlug) {
                const brId = Number(this.localStorage.getItem('brId'));
                if (brId) {
                    this.tId.push(+brId);
                }
            }
        }, e=>{});

        this.getAthorizationData();

        

        this.tenTagName = document.getElementsByTagName('tag');

        this.route.queryParams.pipe(
            takeUntil(this.destroyStream$)
        ).subscribe(params => {
            setTimeout(() => {
                this.subCatId = params['category_ids[]'] ? params['category_ids[]'] : Number(this.localStorage.getItem('catId'));
                if (this.subCatId !== 0 && this.goNext &&  this.idCategory) {
                    if (this.subCatId) {
                        this.subCatChooseIds.push(Number(this.subCatId));
                    }    
                }
                this.getUnitAll();
                this.getBrandsAll();
                this.prevUrl = this.sessionStorage.getItem('prevUrl') ? this.sessionStorage.getItem('prevUrl').split('/') : [];
                if (typeof  params['category_ids[]'] !== 'undefined' &&
                    this.route.url['value'].length === 0 && this.prevUrl[1] !== 'category' && this.prevUrl[1] !== '' && this.goNextTo) {
                    this.prevUrl = [];
                    this.countFilter++;
                    if (this.filter.length) {
                        this.filter.forEach((a) => {
                            if (a.id && this.productslist.length > 0) {
                                this.filterForm.get('category' + Number(a.id)).patchValue(false);
                            }
                        });
                    }
                    this.filter = [];
                    for (const [key, value] of Object.entries(params)) {
                        if (key === 'category_ids[]') {
                            this.filter.push({id: Number(value), name: key});
                        }
                    }
                    this.checkAllParams();
                    this.typeRequestApi();
                }
            }, 500);
            this.searchWord = params['pattern'];
            if (this.searchWord && this.searchString !== this.searchWord) {
                this.resFilterCategory = true;
                this.resetFlags();
                // (async () => {
                //     await  this.getUnitAll();
                //     await this.getBrandsAll();
                // })();
                this.getAllProducts(this.page, this.perPage, this.idCategory,
                    this.has_discount, this.sortString, this.searchWord, this.is_favorite, null, this.weight, this.hasNew);
            }
        }, e=>{});

        this.helperService._sendStatusEvent.pipe(
            takeUntil(this.destroyStream$)
        ).subscribe((bool) => {
            if (bool) {
                this.resFilterBrand = true;
                this.resFilterUnit = true;
                this.resFilterCategory = true;
                this.resetFilter();
            }
        }, e=>{});

        this._opened = this.helperService._opened;

        this.utilitiesService.sendStatusSearchEvent.pipe(
            takeUntil(this.destroyStream$)
        ).subscribe((srt) => {
            if (srt) {
                this.searchWord = '';
                this.searchString = '';
                this.resetSearch();
            }
        }, e=>{});

        this.utilitiesService.ageConfirmEvent.pipe(
            takeUntil(this.destroyStream$)
        ).subscribe((st) => {
            (() => {
                this.brandslist = [];
                this.unitlist = [];
                this.getUnitAll();
                this.getBrandsAll();
            })();
            if (st) {
                this.status = true;
                if (this.preLoadProd) {
                    this.productslist = [];
                    this.getAllProducts(this.page,
                        this.perPage,
                        this.idCategory,
                        this.has_discount,
                        this.sortString,
                        this.searchString,
                        this.is_favorite,
                        null,
                        this.weight,
                        this.hasNew);
                }
            } else {
                this.status = false;
            }
            if (this.hasCensoredCat) {
                this.categorieslist = [];
                this.checkIdCategory();
            }
        }, e=>{});

        this.status = this.cookie.get('ageConfirm') === '1';
    }

    @HostListener('document:scroll', ['$event'])

    onScroll(event) {
        const toTop = document.querySelector('.to_top');
        const st = window.pageYOffset || document.documentElement.scrollTop;
        this.lastScrollTop = st <= 0 ? 0 : st;
        if (toTop) {
            if (this.lastScrollTop === 0) {
                toTop.classList.remove('showIcon');
            } else {
                toTop.classList.add('showIcon');
            }
        }
    }

    setError(r:any, e?:HttpErrorResponse){
        let id = 0;
        if(this.errorsService.errorsArray.length > 0 && this.errorsService.errorsArray[this.errorsService.errorsArray.length - 1]){
            id = this.errorsService.errorsArray[this.errorsService.errorsArray.length - 1].errorID + 1;
        }
        if(!!e){
            let error: Error = {
                errorMessage: e.message,
                errorType: ERRORSTYPES.INSIDE,
                errorCode: e.status,
                errorID: id
            }
            this.errorsService.setErrors(error);
        } else {         
            let error: Error = {
                errorMessage: r.message,
                errorType: ERRORSTYPES.DEFAULT,
                errorCode: r.error,
                errorID: id
            }
            this.errorsService.setErrors(error);
        }
    }

    _toggleSidebar() {
        this.helperService._opened = !this.helperService._opened;
        this._opened = !this._opened;
        if (this.showButton) {
            this.utilitiesService.filterOpen(this._opened);
        }
    }

    tagColor() {
        setTimeout(() => {
            if (this.tenTagName && this.cutBrand.length) {
                for (let i = 0; i < this.tenTagName.length; i++) {
                    this.tenTagName[i].id = 'brand_' + this.cutBrand[i]['id'];
                }
                this.filter.forEach((v) => {
                    if(v.name === 'brand_ids') {
                        const tagName = document.getElementById('brand_' + v.id);
                        if (tagName) {
                            tagName.style.cssText = 'background: #868F9F';
                            tagName.classList.add('text_col');
                        }
                    }
                });
            }
        }, 3500);
    }

    closed(e) {
        this._opened = false;
        this.helperService._opened = false;
        if (this.showButton) {
            this.utilitiesService.filterOpen(false);
        }
    }

    updateFilterArray(filter) {
        filter.forEach(element => {
            const arr = element.name ? element.name.split('[') : [];
            element.name = arr[0];
        });
    }

    onSelected(tag) {
        if (tag) {
            this.goNext = false;
            this.resFilterBrand = false;
            this._opened = false;
            this.sortString = '';
            if (this.sessionStorage.getItem('sort')) {
                this.sortString += this.sessionStorage.getItem('sort');
            }
            this.page = 0;
            this.currentPage = 0;
            this.perPage = 40;
            this.localStorage.removeItem('currentPage');
            this.localStorage.removeItem('hash');
            for (let i = 0; i < this.tenTagName.length; i++) {
                this.tenTagName[i].id = 'brand_' + this.cutBrand[i]['id'];
                this.tenTagName[i].classList.add('dis');

            }
            const tagName = document.getElementById('brand_' + tag.id);
            if (tagName && tagName.classList.contains('text_col')) {
                this.tId.forEach((a, b) => {
                    if (a === tag.id) {
                        this.tId.splice(b, 1);
                    }
                });
                this.filter.filter((res, ind) => {
                    if ((tag.id === Number(res.id))) {
                        this.filterForm.get('brand' + tag.id).patchValue(false);
                        this.filter.splice(ind, 1);
                        tagName.style.cssText = 'background: #f9f9f9';
                        tagName.classList.remove('text_col');
                    }
                });
            } else {
                this.tId.push(tag.id);
                if (tagName) {
                    tagName.style.cssText = 'background: #868F9F';
                    tagName.classList.add('text_col');
                }
                if (tag.name) {
                    this.filter.push({id: tag.id, name: 'brand_ids'});
                    if (this.minWeight || this.maxWeight) {
                        this.filter.push({id: this.minWeight, name: 'minWeight'});
                        this.filter.push({id: this.maxWeight, name: 'maxWeight'});
                    }
                    this.countFilter++;
                }
                const obj = {};
                for (let i = 0; i < this.filter.length; i++) {
                    obj[this.filter[i]['id']] = this.filter[i];
                }
                this.filter = [];
                for (const key in obj) {
                    this.filter.push(obj[key]);
                }
            }
            this.previousTarget = this.filter;
            this.checkAllParams();
            if (this.searchString) {
                this.check = true;
                this.filterForm.get('brand' + tag.id).patchValue(true);
                if (this.brandslist.length > 0) {
                    for (let i = 0; i < this.tenTagName.length; i++) {
                        if (this.tenTagName[i].classList.contains('dis')) {
                            setTimeout(() => {
                                if (this.tenTagName[i]) {
                                    this.tenTagName[i].classList.remove('dis');
                                }
                            }, 800);
                        }
                    }
                }
                this.router.navigate([], {queryParams: this.queryParams});
                this.getAllProducts(this.page, this.perPage, this.idCategory, this.has_discount, this.sortString, this.searchString, this.is_favorite, null, this.weight, this.hasNew);
            } else {
                (() => {
                    this.brandslist = [];
                    this.unitlist = [];
                    this.check = true;
                    this.getUnitAll();
                    this.getBrandsAll();
                })();

                this.router.navigate([], {queryParams: this.queryParams});
                this.getAllProducts(this.page, this.perPage, this.idCategory, this.has_discount, this.sortString, this.searchString, this.is_favorite, null, this.weight, this.hasNew);
            }
        } else {
            for (let i = 0; i < this.tenTagName.length; i++) {
                this.tenTagName[i].style = '';
                if (this.tenTagName[i]) {
                    this.tenTagName[i].classList.remove('text_col');
                }
            }
        }
    }

    getAthorizationData() {
        if (this.localStorage.getItem('userData')) {
            this.userData = this.localStorage.getItem('userData');
            this.userData = JSON.parse(this.userData);
            this.auth_token = this.userData['auth_token'];
            if (this.auth_token) {
                this.auth = true;
                if (this.localStorage.getItem('confirmEmail')) {
                    this.rest.setAuthorizationTokenBearer(this.auth_token);
                    this.product_list_rest.setAuthorizationTokenBearer(this.auth_token);
                } else {
                    this.rest.setAuthorizationToken(this.auth_token);
                    this.product_list_rest.setAuthorizationToken(this.auth_token);
                }
            } else {
                this.auth = false;
            }
            if (this.userData.role === 2) {
                this.userCustomer = true;
            } else {
                this.userCustomer = false;
            }
        } else {
            this.auth = false;
        }
    }

    public checkAuthorization() {
        this.utilitiesService.authEvent.pipe(
            takeUntil(this.destroyStream$)
        ).subscribe((auth:boolean) => {
                this.auth = auth;
                if (!this.auth) {
                    this.userCustomer = true;
                    this.productslist = [];
                    this.typeRequestApi();
                }
                this.getAthorizationData();
            }, e=>{}
        );
    }

    typeRequestApi() {
        const elem = document.getElementById('body');

        if (elem && typeof(elem.scrollIntoView) === 'function') {
            elem.scrollIntoView({block: 'start'});
        }

        this.isLoading = true;
        this.goNextTo = false;
        this.getProductLoading = true;
        this.sortString = '';
        this.checkIdCategory();

        if (this.filterParams !== '') {
            this.tId = [];
            this.filter.forEach(element => {
                if (element.name === 'category_ids') {
                    this.selectedOrderName = element.id;
                }
                if (element.name === 'brand_ids') {
                    this.tId.push(element.id);
                }
                this.elName = element.name;
                if (element.name === 'minWeight') {
                    this.minWeight = element.id;
                }
                if (element.name === 'maxWeight') {
                    this.maxWeight = element.id;
                }
                if (element.name !== 'minWeight' && element.name !== 'maxWeight'
                    && element.name !== 'type'  && element.name !== 'slug') {
                    this.sortString += '&' + element.name + '[]=' + element.id;
                } else {
                    this.sortString += '&' + element.name + '=' + element.id;
                }
            });
        }

        if ((!this.selectedOrderName || this.filter.length === 0) && !this.localStorage.getItem('catId') ) {
            ( () => {
                this.getUnitAll();
                this.getBrandsAll();
            })();
        }

        this.currentPage = 1;
        this.perPage = 40;

        if (this.filter.length && this.selectedOrderName) {
            if (this.subCatIds.length) {
                this.brandslist = [];
                this.unitlist = [];
                this.getUnitAll();
                this.getBrandsAll();
            }
        }

        if (this.localStorage.getItem('currentPage')) {
            this.currentPage = parseInt(this.localStorage.getItem('currentPage'), 10);
            this.perPage = this.currentPage * this.perPage;
        }

        if (this.sessionStorage.getItem('sort')) {
            const val = this.sessionStorage.getItem('sort').split('&sort=')[1];
            this.selectedOrderName = val;
            this.sortString = this.sortString.replace('sort[]', 'sort');
            this.sortString += this.sessionStorage.getItem('sort');
            this.orderNames.forEach((e: any, v: any) => {
                if (e.id === val) {
                    this.choosenFilter = e;
                }
            });
        }

        this.tagColor();

        if (this.sessionStorage.getItem('prevUrl') === '/login') {
            setTimeout(() => {
                this.getAllProducts(this.page,
                    this.perPage,
                    this.idCategory,
                    this.has_discount,
                    this.sortString,
                    this.searchString,
                    this.is_favorite,
                    null,
                    this.weight,
                    this.hasNew);

            }, 1000);
        } else {
            this.getAllProducts(this.page,
                this.perPage,
                this.idCategory,
                this.has_discount,
                this.sortString,
                this.searchString,
                this.is_favorite,
                null,
                this.weight,
                this.hasNew);
        }
        if (this.idCatalog !== null) {
            this.idcatBool = true;
            this.idcatBool2 = true;
        } else {
            this.idcatBool = false;
            this.idcatBool2 = false;
        }
    }

    changeProductsType(type) {
        this.productListype = type;
        this._cookieService.put('isShowingProductsList', type);
    }

    removeAllcheckTags() {
        const tagsAll: any  = document.getElementsByTagName('tag');
        if (tagsAll) {
            for (let i = 0; i < tagsAll.length; i++) {
                tagsAll[i].style.cssText = '';
                if (tagsAll[i]) {
                    tagsAll[i].classList.remove('text_col');
                }
            }
        }
        for (let i = 0; i < this.filter.length; i++ ) {
            if (this.filter[i].name) {
                if ((this.filter[i].name === 'brand_ids') || (this.filter[i].name === 'units')) {
                    this.filter.splice(this.filter[i], i + 1);
                }
            }
        }
    }

    checkIdCategory() {
        this.isLoading = true;
        this.rest.getCategories()
            .then(categorieslist => {
                if(categorieslist['error'] !== 0) {
                    this.setError(categorieslist);
                }
                if (this.categorieslist.length <= 0) {
                    this.categoriesNone = true;
                } else {
                    this.categoriesNone = false;
                }

                setTimeout(() => {
                    if (this.subCatId === 0 && this.idCategory === 0 && categorieslist['hasCensored']) {
                        this.hasCensoredCat = categorieslist['hasCensored'];
                    } else {
                        this.hasCensoredCat = false;
                    }
                }, 400);

                categorieslist['items'].forEach((s, k) => {
                    if (this.categoriesNone) {
                        this.categorieslist.push(s);
                    }

                    setTimeout(() => {
                        if (s['censoredImage']['desktop']) {
                            s['status'] = !this.status;
                            if (!this.status) {
                                s['subcats'].forEach((child) => {
                                    this.filterForm.get('category' + child['id']).disable();
                                });
                            } else {
                                s['subcats'].forEach((child) => {
                                    this.filterForm.get('category' + child['id']).enable();
                                });
                            }
                        }
                    }, 1200);

                    if (s['id'] === Number(this.subCatId)) {
                        if (Number(this.subCatId) > 0 ) {
                            this.hasCensoredCat = s['censoredImage'].length !== 0;
                        }
                        this.hasParentActive = Number(this.subCatId);
                        this.isMainCategory = true;
                    }

                    s['subcats'].forEach((child) => {
                        this.filterForm.addControl('category' + child['id'], new FormControl(false));
                        if (this.filterSubCatSlug && this.filterSubCatSlug.length > 0) {
                            this.filterSubCatSlug.forEach((element) => {
                                if (element.name === 'subSlug' && element.id === child['slug']) {
                                    this.filterForm.get('category' + child['id']).patchValue(true);
                                }
                            });
                        }

                        if (this.filter && this.filter.length > 0) {
                            this.filter.forEach((element) => {
                                if (element.name === 'category_ids' && +element.id === +s['id']) {
                                    this.hasParentActive = +element.id;
                                }
                                if (element.name === 'category_ids' && +element.id === +child['id']) {
                                    this.filterForm.get('category' + child['id']).patchValue(true);
                                }
                            });
                        }

                        setTimeout(() => {
                            if (child['id'] === Number(this.subCatId)) {
                                this.patchCats.push(Number(this.subCatId));
                            }
                        }, 500);

                        setTimeout(() => {
                            if (child['id'] === +this.subCatId) {
                                if (+this.subCatId > 0) {
                                    this.hasCensoredCat = s['censoredImage'].length !== 0;
                                }
                            }
                        }, 200);

                        if (this.idcatBool && (this.idCategory === child['id'] || this.idCategory === 0)) {
                            this.categoryExist = true;
                        }

                    });

                    if (this.idcatBool && (this.idCategory === s['id'] || this.idCategory === 0)) {
                        this.categoryExist = true;
                    }
                });
            }, err => {
                this.categorieslist = [];
                this.setError(null, err);
            });
    }

    public getActionProduct() {
        if (this.searchString) {
            this.checkIdCategory();
        }
        this.sortString = '';
        this.searchInputString();
        this.page = 0;
        this.currentPage = 0;
        this.perPage = 40;
        this.localStorage.removeItem('currentPage');
        this.localStorage.removeItem('hash');
        this.has_discount = this.has_discount ? false : true;

        if (this.has_discount) {
            this.countFilter++;
        } else {
            this.countFilter--;
        }

        if (this.sessionStorage.getItem('sort')) {
            this.sortString += this.sessionStorage.getItem('sort');
        }

        const catId = Number(this.localStorage.getItem('catId'));

        if (catId) {
            this.filter.push({ id: catId, name: 'category_ids' });
        }

        this.checkAllParams();

        const specProd = this.route.snapshot.paramMap.get('specProd');
        if (specProd === 'skidki' || specProd === 'novinki' || catId) {
            if (catId) {
                this.unitlist = [];
                this.brandslist = [];
                this.getUnitAll();
                this.getBrandsAll();
            }
            this.router.navigate(['/catalog'], {queryParams: this.queryParams});
            this.localStorage.removeItem('catId');
        } else {
            this.router.navigate([], {queryParams: this.queryParams});
            this.getAllProducts(this.page, this.perPage, this.idCategory, this.has_discount, this.sortString, this.searchString, this.is_favorite, null, this.weight, this.hasNew);
        }
    }
    /**
     * getNewProduct
     */
    public getNewProduct() {
        if (this.searchString) {
            this.checkIdCategory();
        }
        this.sortString = '';
        this.searchInputString();
        this.page = 0;
        this.currentPage = 0;
        this.perPage = 40;
        this.localStorage.removeItem('currentPage');
        this.localStorage.removeItem('hash');
        this.hasNew = this.hasNew ? false : true;

        if (this.hasNew) {
            this.countFilter++;
        } else {
            this.countFilter--;
        }

        if (this.sessionStorage.getItem('sort')) {
            this.sortString += this.sessionStorage.getItem('sort');
        }

        const catId = Number(this.localStorage.getItem('catId'));
        if (catId) {
            this.filter.push({ id: catId, name: 'category_ids' });
        }

        this.checkAllParams();

        const specProd = this.route.snapshot.paramMap.get('specProd');
        if (specProd === 'novinki' || specProd === 'skidki' || catId) {
            if (catId) {
                this.unitlist = [];
                this.brandslist = [];
                (async () => {
                    await this.getUnitAll();
                    await this.getBrandsAll();
                })();
            }
            this.router.navigate(['/catalog'], {queryParams: this.queryParams});
            this.localStorage.removeItem('catId');
        } else {
            this.router.navigate([], {queryParams: this.queryParams});
            this.getAllProducts(this.page, this.perPage, this.idCategory, this.has_discount, this.sortString, this.searchString, this.is_favorite, null, this.weight, this.hasNew);
        }
    }

    // favorites
    getProductsFavorites() {
        if (this.searchString) {
            this.checkIdCategory();
        }

        this.sortString = '';
        this.searchInputString();
        this.page = 0;
        this.currentPage = 0;
        this.perPage = 40;
        this.localStorage.removeItem('currentPage');
        this.localStorage.removeItem('hash');
        this.is_favorite = this.is_favorite ? false : true;

        if (this.is_favorite) {
            this.countFilter++;
        } else {
            this.countFilter--;
        }

        if (this.sessionStorage.getItem('sort')) {
            this.sortString += this.sessionStorage.getItem('sort');
        }

        this.checkAllParams();

        this.router.navigate([], { queryParams: this.queryParams });
    }

    checkAllParams() {
        this.page = 0;
        this.queryParams = {};

        if (this.has_discount) {
            this.queryParams = Object.assign({ has_discount: 1 }, this.queryParams);
        }

        if (this.hasNew) {
            this.queryParams = Object.assign({ is_new: 1 }, this.queryParams);
        }

        if (this.is_favorite) {
            this.queryParams = Object.assign({ is_favorite: 1 }, this.queryParams);
        }

        if (this.sortName !== 0 && this.sortName) {
            if (this.sessionStorage.getItem('sort')) {
                this.sortName = this.sessionStorage.getItem('sort').split('&sort=')[1];
            }
            this.queryParams = Object.assign({ sort: this.sortName }, this.queryParams);
        }

        if (this.isSearchString || this.searchString) {
            this.queryParams = Object.assign({ pattern: this.searchString }, this.queryParams);
        }

        this.filter.forEach((element): any => {
            const name = element.name + '[' + element.id + ']';
            const value = element.id;
            element.queryParams = { [name]: value };
            this.queryParams = Object.assign(element.queryParams, this.queryParams);
            if (element.name !== 'minWeight' && element.name !== 'maxWeight') {
                this.sortString += '&' + element.name + '[]=' + element.id;
            } else {
                this.sortString += '&' + element.name + '=' + element.id;
            }
        });
        if(window && window.innerWidth >= 1206){
            this.productslist = [];
        }
    }

    /**
     * sortProduct
     */
    public sortProduct(filter, filterId, status, prop = null) {
        this.otherSubCatChooseIds = [];
        if (prop === 'cat_id') {
            this.localStorage.removeItem('catId');
            this.hasParentActive = filterId;
            this.filter = [];
            this.queryParams = {};
            this.sortString = '';
            if (this.patchCats.length > 0) {
                this.patchCats.forEach((v, k) => {
                    this.filterForm.get('category' + v).patchValue(false);
                });
            }
            this.subCatChooseIds = [];
            this.subCatChooseIds.push(filterId);
        }

        setTimeout(() => {
            if (this.hasCensoredCat || this.hasCensoredProd) {
                this.utilitiesService.checkModal(true);
            }
        }, 2500);

        this.searchInputString();

        this.sortString = '';

        if (this.sessionStorage.getItem('sort')) {
            this.sortString += this.sessionStorage.getItem('sort');
        }

        this.page = 0;
        this.currentPage = 0;
        this.perPage = 40;
        this.maxWeight = '';
        this.minWeight = '';
        this.localStorage.removeItem('currentPage');
        this.localStorage.removeItem('hash');

        if (this.hasChildActive) {
            this.sortString += '&category_ids[]=' + Number(this.hasChildActive);
            const hasChildActive = this.hasChildActive;
            const nameParam = 'category_ids[' + hasChildActive + ']';
            this.queryParams = Object.assign({ [nameParam]: hasChildActive }, this.queryParams);
        }

        if (status) {
            this.filter.push({ id: filterId, name: filter });
            this.countFilter++;
        } else {
            this.filter = this.filter.filter(res => res.name !== 'category_ids' ? res.id !== filterId : Number(res.id) !== Number(filterId));
            this.countFilter--;
        }

        if (prop === 'sub_cat') {
            const subId = Number(this.localStorage.getItem('catId'));
            if (subId) {
                this.filter.push({ id: +subId, name: filter });
            }

            this.localStorage.removeItem('catId');
            this.filter.forEach((v, k) => {
                if (Number(v['id']) === this.hasParentActive) {
                    this.filter.splice(k, 1);
                }
            });
        }

        if (filter === 'brand_ids' && status) {
            const brId = Number(this.localStorage.getItem('brId'));
            if (brId) {
                this.filter.push({id: +brId, name: filter});
            }
            this.localStorage.removeItem('brId');
        }

        this.checkAllParams();
        
        if (!status && filter === 'category_ids') {
            this.subCatIds = [];
            this.brandslist = [];
            this.unitlist = [];
            for (let i = 0; i < this.subCatChooseIds.length; i++ ) {
                if (filterId === Number(this.subCatChooseIds[i])) {
                    this.subCatChooseIds.splice(i, 1);
                }
            }
            for (let i = 0; i < this.filter.length; i++ ) {
                if (filterId === Number(this.filter[i].id)) {
                    this.filter.splice(i, 1);
                }
            }
            for (const key in this.queryParams) {
                if (this.queryParams[key] === filterId) {
                    delete this.queryParams[key];
                }
            }
            this.getUnitAll();
            this.getBrandsAll();
        }

        if (filter === 'category_ids' && status) {
            this.resFilterCategory = false;

            this.categorieslist.forEach((v) => {
                if (v.id === this.idCategory) {
                    v.subcats.forEach((c) => {
                        c.id === filterId ? this.catBold = true : this.catBold = false;
                    });
                }
            });

            this.subCatIds = [];
            this.brandslist = [];
            this.unitlist = [];

            if (prop === 'sub_cat') {
                this.subCatChooseIds = [];
                this.filter.forEach((v, k) => {
                    if (v.name === 'category_ids') {
                        this.subCatChooseIds.push(v.id);
                        this.patchCats.push(v.id);
                    }
                });
                this.subCatChooseIds.forEach((v, k) => {
                    if (v === this.hasParentActive) {
                        this.subCatChooseIds.splice(k, 1);
                    }
                });
                this.hasParentActive = 0;
            }

            if (this.nextStep) {
                this.check = false;
                this.getUnitAll();
                this.getBrandsAll();
            }
            for (const key in this.queryParams) {
                if (key.indexOf('brand') >= 0) {
                    this.filterForm.get('brand' + this.queryParams[key]).patchValue(false);
                    this.sortString = this.sortString.replace('&brand_ids[]=' + this.queryParams[key], '');
                    delete this.queryParams[key];
                }

                if (key.indexOf('units') >= 0) {
                    this.filterForm.get('units' + this.queryParams[key]).patchValue(false);
                    this.sortString = this.sortString.replace('&units[]=' + this.queryParams[key], '');
                    delete this.queryParams[key];
                }
            }
            this.removeAllcheckTags();
        } else {

            this.categorieslist.forEach((v) => {
                if (v.id === this.idCategory) {
                    this.catBold = true;
                }
            });

        }

        if (filter === 'brand_ids' && !status) {
            this.unitlist = [];

            this.tId.forEach((a, b) => {
                if (a === filterId) {
                    this.tId.splice(b, 1);
                }
            });

            const subId = Number(this.localStorage.getItem('catId'));
            for (let i = 0; i < this.subCatChooseIds.length; i++ ) {
                if (subId === Number(this.subCatChooseIds[i])) {
                    this.subCatChooseIds.splice(i, 1);
                }
            }
            this.getUnitAll();
            const tagName = document.getElementById('brand_' + filterId);
            if (tagName) {
                tagName.style.cssText = '';
                tagName.classList.remove('text_col');
            }
        }

        if (filter === 'units' && status) {
            if (this.searchString) {
                this.resFilterUnit = false;
                this.resFilterBrand = false;
            }

            this.filter.forEach((c, v) => {
                if (c.name === 'minWeight') {
                    this.filter.splice(v, 1);
                }

                if (c.name === 'maxWeight') {
                    this.filter.splice(v, 1);
                }
            });
        }
        if (filter === 'brand_ids' && status) {
            if (this.searchString) {
                this.resFilterBrand = false;
            }
            this.tId.push(filterId);
            this.unitlist = [];
            if (this.nextStepBr) {
                this.getUnitAll();
            }
        }
        this.tagColor();
        const specProd = this.route.snapshot.paramMap.get('specProd');
        if ((this.router.url.split('/')[1] === 'category' || this.router.url.split('/')[1] === 'brand' ||
        this.router.url.split('/')[1] === 'special') &&
        (filter === 'category_ids' || filter === 'brand_ids' || specProd === 'novinki' || specProd === 'skidki')) {
            if(window && window.innerWidth >= 1206){
                this.router.navigate(['/catalog'], {queryParams: this.queryParams});
            }
        } else {
            if(window && window.innerWidth >=1206){
                this.router.navigate(['/catalog'], {queryParams: this.queryParams});
            }
            this.getAllProducts(this.page, this.perPage, this.idCategory, this.has_discount, this.sortString, this.searchString, this.is_favorite, null, this.weight, this.hasNew);
        }
    }

    getFillters() {
        if(this.countFilter > 0) {
            this.helperService._opened = false;
            this.router.navigate(['/catalog'], {queryParams: this.queryParams});
            this.productslist = [];
            this.getAllProducts(this.page, this.perPage, this.idCategory, this.has_discount, this.sortString, this.searchString, this.is_favorite, null, this.weight, this.hasNew);
        } else {
            this.helperService._opened = false;
            this.resetFilter();
        }
    }

    /**
     * getAllProducts
     */
    hideFilter = false;
    public getAllProducts(page, perPage, idCategory?, has_discount?, sortString?, searchString?, is_favorite?, frCart?, weight?, is_new?) {
        this.searchInputString();
        const prevUrl = this.sessionStorage.getItem('prevUrl') ? this.sessionStorage.getItem('prevUrl').split('/') : [];
        if (this.showButton && idCategory && !this.browserRefresh && this.num === 1 &&
            (prevUrl[1] !== 'product' &&  prevUrl[1] !== '' && prevUrl[1] !== 'category' && this.filterButton)) {
            this._opened = true;

            setTimeout(() => {
                this.categorieslist.forEach(element => {
                    if (element['id'] === this.idCategory) {
                        this.openFil = this.idCategory;
                    }
                });
            },  800);

        }
    
        this.getProductLoading = true;
        this.totalCount = NaN;

        if (!this.localStorage.getItem('catId') &&  !this.nextStep && this.router.url.split('/')[1] !== 'special'
            && (!this.hasNew || !this.has_discount)) {
            this.check = true;
            this.filter.forEach((v, k) => {
                if (v.name === 'category_ids') {
                    this.subCatChooseIds.push(v.id);
                }
            });
            this.getUnitAll();
            this.getBrandsAll();
            this.nextStep = true;
        }

        if (!this.localStorage.getItem('brId') && this.localStorage.getItem('catId') &&  !this.nextStepBr &&
            this.router.url.split('/')[1] !== 'special' && (!this.hasNew || !this.has_discount) && this.tId.length > 0) {
            const catId = Number(this.localStorage.getItem('catId'));
            if (catId) {
                this.subCatChooseIds.push(+catId);
            }
            this.getBrandsAll();
            this.getUnitAll();
            this.nextStepBr = true;
        }

        this.product_list_rest.getAllProducts(page, perPage, idCategory, has_discount, sortString, searchString, is_favorite, frCart, weight, is_new).
        then(productslist => {
                      
            if(productslist['error'] !== 0){
                this.setError(productslist);
                this.hideFilter = true;
            }
            if(productslist['items'].length === 0){
                this.hideFilter = true;
            }
            if (productslist['hasCensored']) {
                this.hasCensoredProd = productslist['hasCensored'];
            } else {
                this.hasCensoredProd = false;
            }
            this.num++;
            this.getProductLoading = false;
            this.totalCount = productslist['pagination']['totalItemsCount'];
            this.allpage = Math.ceil(this.totalCount / productslist['pagination']['perPage']);
            this.seoH1 = productslist['seo']['h1'];

            setTimeout(() => {
                if (!this.showBrandBlock && !this.seoH1) {
                    this.utilitiesService.cutBrandCountSeo(true);
                } else {
                    this.utilitiesService.cutBrandCountSeo(false);
                }

                if (this.showBrandBlock && this.seoH1) {
                    this.utilitiesService.twice(true);
                } else {
                    this.utilitiesService.twice(false);
                }
            }, 900);

            this.seoText = productslist['seo']['text'];

            productslist['items'].forEach((s, index, arr) => {
                
                if (s['discount'] && s['hasAction'] && s['discount']['maxCount']) {
                    if (s['inCart'] > s['discount']['maxCount']) {
                        s['inCart'] = s['discount']['maxCount'];
                    }
                }

                if (s['inCart'] % s['batchSize'] !== 0 ) {
                    s['inCart'] = Math.ceil(s['inCart'] / s['batchSize']) * s['batchSize'];
                }

                if (s['censoredImage']['desktopSmall']) {
                    s['status'] = !this.status;
                    this.preLoadProd = true;
                }

                if (s['name'].length > 50) {
                    let shortNameBlock = s['name'].slice(0, 50);
                    shortNameBlock += '...';
                    s['shortNameBlock'] = shortNameBlock;
                } else {
                    s['shortNameBlock'] = s['name'];
                }

                if (s['name'].length > 90) {
                    let shortNameList = s['name'].slice(0, 80);
                    shortNameList += '...';
                    s['shortNameList'] = shortNameList;
                } else {
                    s['shortNameList'] = s['name'];
                }

                if (s['isCart'] > 0) {
                    let addProduct = {
                        'addProduct': true
                    };
                    s = Object.assign(s, addProduct);
                }
                this.productslist.push(s);            
            });
            this.titleService.setTitle(productslist['seo']['title']);
            this.metaService.updateTag({name: 'description', content: productslist['seo']['description']});
            this.metaService.updateTag({name: 'keywords', content: productslist['seo']['keywords']});

            if (this.totalCount ===  this.productslist.length) {
                this.noDownladMore = true;
            } else {
                this.noDownladMore = false;
            }

            if (this.countFilter > 0 && !this.showButton && this.downladMore) {
                this.helperService._filterCount = this.countFilter;
                this.helperService._opened = this._opened;
                // must be delete;
                this.utilitiesService.sendCount(this.countFilter);
                // must be delete
            } else if (this.countFilter > 0 && this.showButton) {
                this.helperService._filterCount = this.countFilter;
                // must be delete
                this.utilitiesService.sendCount(this.countFilter);
                // must be delete
            }

            if (this.countFilter === 0) {
                this.helperService._filterCount = this.countFilter;
                // must be delete
                this.utilitiesService.sendCount(this.countFilter);
                // must be delete
            }

            if (this.countFilter > 0 && this.searchString) {
                this.helperService._filterCount = this.countFilter;
                // must be delete
                this.utilitiesService.sendCount(this.countFilter);
                // must be delete
            }

            if (this.filter.length > 0 && !this.showButton) {
                this.categoryActive = true;
                this.helperService._opened = true;
            }

            if (this.localStorage.getItem('hash')) {
                this.productListype ? this.currentProd = 1 : this.currentProd = 0;
                const cv: any = Number(this.localStorage.getItem('hash')) - this.currentProd;
                const elem = document.getElementById(cv);
                if (elem && typeof(elem.scrollIntoView) === 'function') {
                    elem.scrollIntoView({block: this.productListype ? 'center' : 'nearest', behavior: 'smooth'});
                }
            }

            const checkId = document.getElementById(`category${idCategory}`);
            if (checkId) {
                this.filterForm.get(`category${idCategory}`).patchValue(true);
            }

            setTimeout(() => {
                if (this.brandslist.length > 0) {
                    if (this.searchString && this.resFilterBrand) {
                        this.brandListBySearch = [];
                        this.cutBrand = [];
                        for ( let i = 0, len = this.productslist.length; i < len; i++ ) {
                            this.brandListBySearch.push({
                                'id': this.productslist[i]['brand']['id'],
                                'name' : this.productslist[i]['brand']['name']
                            });
                        }
                        this.brandslist = [];
                        this.brandslist = Array.from(this.uniqByKeepLast(this.brandListBySearch, it => it.id));
                        this.isLoading = false;
                    }
                }

            }, 3000);

            if (this.searchString && this.resFilterCategory) {
                this.categorieslistBySearch = [];
                if (this.categorieslist) {
                    for (let i = 0, len = this.productslist.length; i < len; i++) {
                        const catName = this.productslist[i].breadcrumbs[0].name;
                        const parId = this.productslist[i].breadcrumbs[0].id;
                        const subCatId = this.productslist[i].breadcrumbs[1].id;
                        const subCatName = this.productslist[i].breadcrumbs[1].name;
                        this.categorieslist.forEach((e, v) => {
                            if (e['id'] === parId) {
                                this.categorieslistBySearch.push({
                                    'name': catName,
                                    'id': parId,
                                    'subcats': [{
                                        'id': subCatId,
                                        'name': subCatName
                                    }]
                                });
                            }
                        });
                    }
                }

                this.categorieslist = [];
                this.categorieslist = Array.from(this.uniqByKeepLast(this.categorieslistBySearch, it => it.name));
            }
        }, err => {
            if (err['status'] === 401) {
                this.localStorage.removeItem('userData');
                this.localStorage.removeItem('confirmEmail');
                this.localStorage.removeItem('registrationEmail');
                this.utilitiesService.checkAuthorization(false);
                this.rest.deleteAuthorizationToken();
                this.product_list_rest.deleteAuthorizationToken();
                this.typeRequestApi();
            }
            if(err.status !== 401){
                this.setError(null, err);
            }
            this.productslist = [];
        });
    }

    getBrandsAll() {
        this.isLoading = true;
        if (this.brandslist.length <= 0) {                
            this.product_list_rest.getBrandsAll(this.subCatIds.length ? this.subCatIds : this.subCatChooseIds).
            then(brandslist => {
                if(brandslist['error'] !== 0){
                    this.setError(brandslist);
                }
                this.isLoading = false;

                brandslist['items'].forEach((s) => {
                    this.filterForm.addControl('brand' + s['id'], new FormControl(false));

                    if (this.brSlug === s['slug'] && this.check) {
                        this.filterForm.get('brand' + s['id']).patchValue(true);
                        this.brandActive = true;
                    }

                    if (this.filter && this.filter.length > 0) {
                        this.filter.forEach((element, ind) => {
                            if (element.name === 'brand_ids' && Number(element.id) === s['id'] && this.check) {
                                this.filterForm.get('brand' + element.id).patchValue(true);
                                this.brandActive = true;
                            }
                        });
                    }

                    this.brandslist.push(s);
                });                

                if (this.brandslist.length > 0 && this.tenTagName.length) {                    
                    for (let i = 0; i < this.tenTagName.length; i++) {
                        if (this.tenTagName[i].classList.contains('dis')) {
                            setTimeout(() => {
                                if (this.tenTagName[i]) {
                                    this.tenTagName[i].classList.remove('dis');
                                }
                            }, 800);
                        }
                    }
                }

                this.brandslist.length < 20 ? this.showBrandBlock = true : this.showBrandBlock = false;
                this.cutBrand = this.brandslist;

                if (this.showBrandBlock) {
                    this.utilitiesService.cutBrandCount(true);
                } else {
                    this.utilitiesService.cutBrandCount(false);
                }

                if (this.searchString && this.searchString.length > 0) {
                    this.cutBrand = [];
                    setTimeout(() => {
                        this.cutBrand = this.brandslist;
                    }, 3000);
                }
            }, err => {
                this.brandslist = [];
                this.setError(null, err);
            });
        }
    }

    returnFilterFormControlForBrands(id:number):boolean{
        if(this.filterForm.get(`brand${id}`)){
            return true
        } else {
            return false
        }
    }

    getUnitAll() {
        this.isLoading = true;
        if (this.unitlist.length <= 0) {
            this.product_list_rest.getUnitsAll(
                this.subCatIds.length ? this.subCatIds : this.subCatChooseIds, this.tId.length ? this.tId : '' ).
            then(unitlist => {
                if(unitlist['error'] !== 0){
                    this.setError(unitlist);
                }
                this.isLoading = false;
                unitlist['items'].forEach((s, ind) => {                
                    this.filterForm.addControl('units' + s, new FormControl(false));

                    if (this.filter && this.filter.length > 0) {
                        this.filter.forEach((element) => {
                            if (element.name === 'units' && element.id === s['name'] && this.check) {
                                this.filterForm.get('units' + s['name']).patchValue(true);
                                this.unitActive = true;
                            }
                        });
                    }

                    this.unitlist.push(s);
                    this.unitlist.forEach((v, k) => {
                        if(v['name']){
                            this.weightName = v['name'].split(' ')[1];
                        }
                        if (this.weightName === 'г' || this.weightName === 'гр' || this.weightName === 'кг') {
                            this.weight = 'кг';
                        }

                        if (this.weightName === 'мл' || this.weightName === 'л') {
                            this.weight = 'л';
                        }

                        if (this.weightName === 'шт') {
                            this.weight = 'шт';
                        }

                        if (this.weightName === 'листов') {
                            this.weight = 'листов';
                        }
                    });
                    this.weight = '';
                });
            }, err => {
                this.unitlist = [];
                this.setError(null, err);
            });
        }
    }

    uniqByKeepLast(data, key) {
        return  new Map<any[], any[]>(data.map(x => [key(x), x])).values();
    }
    /**
     * cleareSearch
     */

    public cleareSearch() {
        this.searchString = '';
        this.productslist = [];
        this.categorieslist = [];
        this.currentPage = 0;
        this.page = 0;
        this.perPage = 40;
        this.localStorage.removeItem('currentPage');
        this.localStorage.removeItem('hash');
        this.brandslist = [];
        this.unitlist = [];
        this.searchWord = '';
        this.searchString = '';
        this.queryParams = {};
        this.resetSearch();
    }

    public checkIfIsLoading() {
        setTimeout(() => {
            this.isLoading = false;
        }, 700);
    }

    public setAllStates() {
        this.utilitiesService.downloadProducts(true);
    }

    public downloadMore(e) {
        this.downladMore = e;
        this.perPage = 40;
        if (this.localStorage.getItem('currentPage')) {
            this.page = parseInt(this.localStorage.getItem('currentPage'), 10);
            this.currentPage = parseInt(this.localStorage.getItem('currentPage'), 10);
        }
        this.page = this.page + this.downloadStep;
        this.localStorage.setItem('currentPage', this.page);
        this.localStorage.removeItem('hash');
        if (this.allpage > this.page) {
            this.getAllProducts(this.page, this.perPage, this.idCategory, this.has_discount, this.sortString, this.searchString, this.is_favorite, null, this.weight, this.hasNew);
        } else {
            this.noDownladMore = true;
        }
    }

    public resetFilter() {
        window.innerWidth >= 1201 ? this.leftClass = true : this.leftClass = false;
        this.resetFlags();

        for (const key in this.queryParams) {

            if (key.indexOf('category_ids') >= 0) {
                delete this.queryParams['category_ids[' + this.queryParams[key] + ']'];
            }

            if (key.indexOf('brand') >= 0) {
                delete this.queryParams['brand_ids[' + this.queryParams[key] + ']'];
            }

            if (key.indexOf('units') >= 0) {
                delete this.queryParams['units[' + this.queryParams[key] + ']'];
            }

            if (key.indexOf('is_favorite') >= 0) {
                delete this.queryParams['is_favorite'];
            }

            if (key.indexOf('has_discount') >= 0) {
                delete this.queryParams['has_discount'];
            }

            if (key.indexOf('is_new') >= 0) {
                delete this.queryParams['is_new'];
            }

            if (key.indexOf('sort') >= 0) {
                delete this.queryParams['sort'];
            }

            if (key.indexOf('type') >= 0) {
                delete this.queryParams['type[' + this.queryParams[key] + ']'];
            }

            if (key.indexOf('slug') >= 0) {
                delete this.queryParams['slug[' + this.queryParams[key] + ']'];
            }
        }

        if (this.idCategory > 0 || this.router.url.split('/')[1] === 'special') {
            this.categorieslist = [];
            this.router.navigate(['/catalog'], { queryParams: this.queryParams});
        } else {
            this.categorieslist = [];
            this.checkIdCategory();
            this.getBrandsAll();
            this.getUnitAll();
            this.router.navigate(['/catalog'], { queryParams: this.queryParams});
            this.getAllProducts(this.page, this.perPage, this.idCategory, this.has_discount, this.sortString, this.searchString, this.is_favorite, null, this.weight, this.hasNew);
        }
    }

    searchUnitsList = [];
    searchUnits(pattern:string){
        if(pattern == ""){
            this.searchUnitsList = [];
            return
        }
        this.rest.searchUnits(pattern).pipe(
            takeUntil(this.destroyStream$)
        ).subscribe(
            r=>{
                let i = 0;
                while(i< r.items.length){
                    if(this.filterForm.get(`units${r.items[i]}`) == (null||undefined)){
                        this.filterForm.addControl(`units${r.items[i]}`, new FormControl(false));
                    }
                    i++;
                }
                this.searchUnitsList = r.items;
            },
            e=>{console.log(e)}
        )
    }

    resetSearch() {
        this.resetFlags();
        delete this.queryParams['pattern'];

        if (this.idCategory > 0) {
            this.router.navigate(['/catalog']);
        } else {
            this.categorieslist = [];
            this.checkIdCategory();
            this.getBrandsAll();
            this.getUnitAll();
            this.router.navigate(['/catalog']);
            this.getAllProducts(this.page, this.perPage, this.idCategory, this.has_discount, this.sortString, this.searchString, this.is_favorite, null, this.weight, this.hasNew);
        }

        this.searchWord = '';
        this.searchString = '';
    }

    openMobileSorts() {
        this.showFilter = !this.showFilter;
    }
    /**
     * openAccordeon
     */

    returnActiveElement(category){
        let a = this.router.url;
        let bool: boolean = false;
        if(category.subcats){
            for(let i = 0; i< category.subcats.length; i++){
                if(a.indexOf(category.subcats[i].id) !== -1){
                    bool = true;
                }
            }
        }
        if(a.indexOf(category.slug) !== -1){
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

    resetFlags() {
        this.unitlist = [];
        this.brandslist = [];
        this.cutBrand = [];
        this.subCatIds = [];
        this.subCatChooseIds = [];
        this.otherSubCatChooseIds = [];
        this.showBrandBlock = false;
        this.selectedOrderName = 0;
        this.hasParentActive = 0;
        this.choosenFilter =  {avatar: 'assets/images/sort/default.svg'};
        this.has_discount = false;
        this.hasNew = false;
        this.is_favorite = false;
        this.countFilter = 0;
        this.sortString = '';
        this.sortName = '';
        this.maxWeight = '';
        this.minWeight = '';
        this.loadNum = 10;
        this.loadunit = 10;
        this.filterForm.reset();
        this.filter = [];
        this.productslist = [];
        this.currentPage = 0;
        this.page = 0;
        this.perPage = 40;
        this.onSelected('');
        this.tId = [];

        setTimeout(() => {
            this.tenTagName = document.getElementsByTagName('tag');
            if (this.tenTagName && this.cutBrand.length) {
                for (let i = 0; i < this.tenTagName.length; i++) {
                    if (this.cutBrand[i]) {
                        this.tenTagName[i].id = 'brand_' + this.cutBrand[i]['id'];
                    }
                }
            }
        }, 2000);

        setTimeout(() => {
            if (this.hasCensoredCat || this.hasCensoredProd) {
                this.status = false;
            }
        }, 2500);

        this.localStorage.removeItem('currentPage');
        this.localStorage.removeItem('hash');
        this.sessionStorage.removeItem('sort');
        this.localStorage.removeItem('catId');
    }

    // cart func
    preventClick(event) {
        event.preventDefault();
        event.stopPropagation();
    }


    roundTo(num, num2) {
        return Math.ceil(num / num2) * num2;
    }

    numberOnly(event): boolean {
        const charCode = (event.which) ? event.which : event.keyCode;
        if (charCode > 31 && (charCode < 48 || charCode > 57)) {
            return false;
        }
        return true;
    }

    changeSort(e, navigate?:boolean): any {
        console.log(e);        
        this.currentPage = 0;
        this.page = 0;
        this.perPage = 40;
        this.localStorage.removeItem('currentPage');
        this.localStorage.removeItem('hash');
        window.innerWidth <= 1206 ? this.showFilter = !this.showFilter : '';
        this.choosenFilter = e;
        this.removeName = false;
        this.sortString = '';

        if (e.id !== 0) {
            this.sortString = '&sort=' + e.id;
        }

        this.selectedOrderName = e.id;
        this.sessionStorage.setItem('sort', this.sortString);

        if (this.sessionStorage.getItem('sort')) {
            this.sortString = '&' + this.sortString.split('&')[1];
        }

        this.sortName = e.id;
        const catId = Number(this.localStorage.getItem('catId'));
        if (catId) {
            this.filter.push({ id: catId, name: 'category_ids' });
        }

        const brId = Number(this.localStorage.getItem('brId'));
        if (brId) {
            this.filter.push({id: +brId, name: 'brand_ids'});
        }
        
        this.checkAllParams();
        if(window && window.innerWidth >= 1206){
            if (catId || brId) {
                this.router.navigate(['/catalog'], {queryParams: this.queryParams});
                this.localStorage.removeItem('catId');
                this.localStorage.removeItem('brId');
            } else {
                this.router.navigate([], {queryParams: this.queryParams});
                // tslint:disable-next-line:max-line-length
                this.getAllProducts(this.page, this.perPage, this.idCategory, this.has_discount, this.sortString, this.searchString, this.is_favorite, null, this.weight, this.hasNew);
            }
        }
        if(navigate){
            this.productslist = [];
            this.router.navigate([], {queryParams: this.queryParams});
            this.getAllProducts(this.page, this.perPage, this.idCategory, this.has_discount, this.sortString, this.searchString, this.is_favorite, null, this.weight, this.hasNew);
        }
    }

    addEl(): any {
        this.removeName = true;
    }

    removeEl(): any {
        this.removeName = false;
    }

    closeFilter() {
        this.showFilter = false;
    }

    loadMore(e): any {
        this.loadNum = e + 10;
        if(this.loadNum === this.brandslist.length){
            this.getNextPageBrands(this.brandslist.length/20)
        }
    }

    getNextPageBrands(page:number){
        this.product_list_rest.updateBrands(page).pipe(
            takeUntil(this.destroyStream$)
        ).subscribe(
            r=>{
                if(r.error == 0){
                    let i = 0;
                    while(i < r.items.length){
                        this.filterForm.addControl('brand' + r.items[i]['id'], new FormControl(false))
                        this.brandslist.push(r.items[i]);
                        i++
                    }
                }
            }, e=>{}
        )
    }

    loadMoreUnit(e): any {
        this.loadunit = e + 10;        
    }

    toTop() {
        window.scroll({ top: 0, behavior: 'smooth' });
    }

    searchInputString()  {
        this.searchString = this.route.snapshot.queryParamMap.get('pattern');
        if (this.searchString) {
            this.queryParams = Object.assign({ pattern: this.searchString }, this.queryParams);
        }
    }

    stopEvent(e, st, cenBySearch, i) {
        if (i) {
           this.localStorage.setItem('hash', i);
        }
        if (st === true || (cenBySearch === true && !this.status)) {
            e.preventDefault();
            e.stopPropagation();
            this.router.navigateByUrl(this.stopUrl);
            this.utilitiesService.checkModal(true);
            return;
        }
    }

    returnQuery(){
        let b = {};
        if(this.queryParams['is_new'] == 1){
            b = Object.assign({'is_new' : 1}, b);
        }
        if(this.queryParams['has_discount'] == 1){
            b = Object.assign({'has_discount': 1}, b);
        } 
        if(this.queryParams['is_favorite'] == 1){
            b = Object.assign({'is_favorite' : 1}, b);
        }
        return b
    }

    returnWidth(){
        return window.innerWidth;
    }

    serchedBrands: any[] = [];
    returnBrandsBySearch(pattern:string){
        if(!!pattern){
            this.product_list_rest.getBrandByPattern(pattern).pipe(
                takeUntil(this.destroyStream$)
            ).subscribe(
                r=>{
                    if(r.error == 0){
                        for(let i = 0; i<r.items.length; i++){
                            if(this.filterForm.get('brand'+r.items[i].id) == (null||undefined)){
                                this.filterForm.addControl('brand' + r.items[i].id , new FormControl(false))
                            }
                        }
                        this.serchedBrands = r.items;
                    }
                }, e=>{}
            )
        } else {
            setTimeout(() => {
                this.serchedBrands = [];
            }, 500);
        };
        
    }

    ngOnDestroy() {
        this.destroyStream$.next(null);
        this.destroyStream$.complete();
    }
}
