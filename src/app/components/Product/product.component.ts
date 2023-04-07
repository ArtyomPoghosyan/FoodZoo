import {Component, Inject, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {DOCUMENT, Location} from '@angular/common';
import {UtilitesService} from '../../services/utilites.service';
import {Router, ActivatedRoute, NavigationEnd} from '@angular/router';
import {ProductService} from '../../services/Products/product.service';
import {RestApiService} from '../../services/rest-api.service';
import {Title, Meta} from '@angular/platform-browser';
import {Subject, Subscription} from 'rxjs';
import {CookieService} from 'ngx-cookie';
import { AppLocalStorageService } from '../../AppTemplates/services/storages/app-local-storage.service';
import { AppSessionStorageService } from '../../AppTemplates/services/storages/app-session-storage.service';
import { HelperServiceService } from '../../AppTemplates/services/helpers/helper-service.service';
import { ClosedApiService } from '../../AppTemplates/services/Portal/closed-api.service';
import { ErrorsService, Error, ERRORSTYPES } from '../../AppTemplates/shared/errors/service/errors.service';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntil } from 'rxjs/operators';


@Component({
    selector: 'app-product',
    templateUrl: './product.component.html',
    styleUrls: ['./product.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ProductComponent implements OnInit, OnDestroy {
    isLoading = true;
    getDataLoading = true;
    auth = false;
    product_id: any = false;
    product: any = [];
    id: number;
    slugOrId: any;
    minAmountProduct: number;
    // authorize
    userData: any;
    userCustomer: boolean;
    mobileImg: boolean;
    auth_token: string;
    total: number;
    firstTotal: number;
    minOrderAmount: number;
    batchSize: number;
    errorMsg: string;
    offerExist: boolean;
    productData: any = [];
    tooltipmessage = '';
    changeProductCounter: boolean;
    notOffers = false;
    is_new: boolean;
    oldIsCart: number;
    quantity: number;
    private sub: any;
    private sub2: any;
    fragment: any;
    parSlug: number;
    subCatSlug: number;
    catName: string;
    catId: any;
    brId: any;
    subCatId: any;
    subCatName: string;
    queryParams: any;
    prevMetaTag;
    sub1: Subscription;
    status: boolean;
    destroyStream$ = new Subject();


    disableBTN: boolean = false;
    constructor(
        private errorsService: ErrorsService,
        public localStorage: AppLocalStorageService,
        public sessionStorage: AppSessionStorageService,
        public helperService: HelperServiceService,
        private closedApi: ClosedApiService,
        @Inject(DOCUMENT) private dom,
        private _location: Location,
        private utilitiesService: UtilitesService,
        public rest: RestApiService,
        public product_rest: ProductService,
        private router: Router,
        private route: ActivatedRoute,
        private titleService: Title,
        private metaService: Meta,
        public cookie: CookieService) {
        router.events.subscribe(s => {
            if (s instanceof NavigationEnd) {
                this.utilitiesService.hideProductSearch([]);
                const tree = router.parseUrl(router.url);
                if (tree.fragment) {
                    this.fragment = tree.fragment;
                    this.localStorage.setItem('hash', tree.fragment);
                }
            }
        });
    }

    ngOnInit() {
        this.localStorage.removeItem('brId');
        this.localStorage.removeItem('catId');
        window.innerWidth <= 420 ? this.mobileImg = true : this.mobileImg = false;
        window.innerWidth <= 480 ? this.is_new = true : this.is_new = false;
        let prevMetaTag;
        this.setAllStates();
        this.checkAutorization();
        this.listenerStates();
        this.sub = this.route.params.subscribe(params => {
            this.slugOrId = this.route.snapshot.paramMap.get('slug');           
            this.getProduct(this.slugOrId);
        });
        const elem = document.getElementById('body');
        if (elem && typeof(elem.scrollIntoView) === 'function') {
            elem.scrollIntoView({behavior: 'smooth'});
        }
        prevMetaTag = this.metaService.getTag('name=description');
        this.prevMetaTag = prevMetaTag.content;
        this.sub1 = this.utilitiesService.ageConfirmEvent.subscribe((st) => {
            if (st) {
                this.getProduct(this.slugOrId);
                this.status = true;
            } else {
                this.status = false;
                this.router.navigateByUrl('/catalog');
            }
        });
        this.status = this.cookie.get('ageConfirm') === '1';
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

    returnTotalPrice(product){
        if(product.discount && product.discount.price){
            return Math.round(parseFloat((product.discount.price * product.unitSize * product.quantity) as any) * 100) / 100;
        } else {
            return Math.round(parseFloat((product.price * product.unitSize * product.quantity) as any) * 100) / 100;
        }
    }

    setCanonicalURL(product?: any) {
        const canURL = '/product/' + product.breadcrumbs[0].slug + "/" + product.breadcrumbs[1].slug + "/" + product.slug;
        const link: HTMLLinkElement = this.dom.createElement('link');
        link.setAttribute('rel', 'canonical');
        this.dom.head.appendChild(link);
        link.setAttribute('href', canURL);
    }

    update() {
        this.titleService.setTitle(this.product['seo']['title']);
        this.metaService.updateTag({name: 'description', content: this.product['seo']['description']});
        this.metaService.updateTag({name: 'keywords', content: this.product['seo']['keywords']});
    }

    getAthorizationData() {
        this.isLoading = true;
        if (this.localStorage.getItem('userData')) {
            this.userData = this.localStorage.getItem('userData');
            this.userData = JSON.parse(this.userData);
            this.auth_token = this.userData['auth_token'];
            if (this.auth_token) {
                this.auth = true;
                if (this.localStorage.getItem('confirmEmail')) {
                    this.rest.setAuthorizationTokenBearer(this.auth_token);
                    this.product_rest.setAuthorizationTokenBearer(this.auth_token);
                } else {
                    this.rest.setAuthorizationToken(this.auth_token);
                    this.product_rest.setAuthorizationToken(this.auth_token);
                }
            } else {
                this.auth = false;
                this.isLoading = false;
            }
            if (this.userData.role === 2) {
                this.userCustomer = true;
            } else {
                this.userCustomer = false;
            }
        } else {
            this.auth = false;
            this.isLoading = false;
        }
    }

    checkAutorization() {
        this.sub2 = this.utilitiesService.authEvent.subscribe(
            (auth) => {
                this.auth = auth;
                this.getAthorizationData();
            }
        );
    }

    getProduct(slugOrId) {
        this.product = [];
        this.isLoading = true;
        this.getDataLoading = true;
        this.offerExist = false;
        if (slugOrId) {
            this.product_rest.getProduct(slugOrId).
            then(product => {
                if(product['error'] !== 0){
                    this.setError(product);
                }
                if (!isNaN(slugOrId)) {                     
                    this.setCanonicalURL(product['item']);
                }
                if (product['item']) {
                    this.checkIfIsLoading();
                    product = product['item'];
                    if (!isNaN(slugOrId)) {                     
                        if (product['breadcrumbs'].length > 0) {
                            this.router.navigate(
                                ['/product', product['breadcrumbs'][0].slug, product['breadcrumbs'][1].slug, product['slug']]);
                            return;
                        } else {
                            this.router.navigate(
                                ['/product', product['slug']]);
                            return;
                        }
                    }
                    this.id = +product['id'];
                    if (product['discount'] && product['discount']['maxCount']) {
                        if (product['quantity'] > product['discount']['maxCount']) {
                            product['quantity'] = product['discount']['maxCount'];
                        }
                    }
                    if(isNaN(product['quantity'])){
                        product['quantity'] = 0;
                    }
                    if (product['censoredImage']['desktopLarge']) {
                        product['status'] = !this.status;
                    }
                    if (product['price']) {
                        if (product['quantity'] % product['batchSize'] !== 0) {
                            product['quantity'] = Math.ceil(product['quantity'] / product['batchSize']) * product['batchSize'];
                        }
                    }
                    if (product['name'].length > 60) {
                        let shortName = product['name'].slice(0, 60);
                        shortName += '...';
                        product['shortName'] = shortName;
                    } else {
                        product['shortName'] = product['name'];
                    }
                    this.product = product;
                    this.brId = this.product.brand.id;
                    if (this.product.breadcrumbs.length > 0) {
                        this.parSlug = this.product.breadcrumbs[0].slug;
                        this.catName = this.product.breadcrumbs[0].name;
                        this.catId = this.product.breadcrumbs[0].id;
                        this.subCatSlug = this.product.breadcrumbs[1].slug;
                        this.subCatName = this.product.breadcrumbs[1].name;
                        this.subCatId = this.product.breadcrumbs[1].id;
                    }

                    this.notOffers = !product['price'];
                    if (product['price']) {
                        if (product['quantity'] > 0) {
                            product['addProduct'] = true;
                            if (product['hasAction'] === 0) {
                                this.total = parseFloat(product['quantity']) * parseFloat(product['price']) * product['unitSize'];
                                this.total = parseFloat(this.total.toFixed(2));
                            }
                            this.minAmountProduct = product['minOrderAmount'];
                            this.offerExist = true;
                            if (product['hasAction'] === 1) {
                                this.total = parseFloat(product['quantity']) * parseFloat(product['discount']['price']) * product['unitSize'];
                                this.batchSize = product['batchSize'];
                                this.total = parseFloat(this.total.toFixed(2));
                            }
                            this.firstTotal = this.total;
                        }
                        if (this.auth) {
                            if (product['quantity'] > 0 && this.offerExist === false) {
                                this.rest.updateProductCart(product['id'], null, product['quantity']).
                                then(addObj => {
                                }, err => {
                                });
                            } else if (this.offerExist === true) {
                                // offer_id
                                this.rest.updateProductCart(product['id'], null, product['quantity']).
                                then(addObj => {
                                }, err => {
                                });
                            }
                        }
                    } else {
                        this.notOffers = true;
                    }
                    setTimeout(() => {
                        this.getDataLoading = false;
                    }, 1000);
                } else {
                    if (product['error'] === 1) {
                        this.router.navigate(['/not-found']);
                    }
                }
                this.update();
            }, err => {
                if (err['status'] === 401) {
                    // unathorize
                    this.localStorage.removeItem('userData');
                    this.localStorage.removeItem('confirmEmail');
                    this.localStorage.removeItem('registrationEmail');
                    this.utilitiesService.checkAuthorization(false);
                    this.rest.deleteAuthorizationToken();
                    this.product_rest.deleteAuthorizationToken();
                    this.getProduct(slugOrId);
                }
                if (err['status'] === 404) {
                    this.router.navigate(['/404']);
                }
                this.setError(null, err);
                this.product = [];
            });
        } else {
            this.router.navigate(['/not-found']);
        }
    }

    backClicked() {
        this._location.back();
    }

    checkAuthorization() {
        this.utilitiesService.authEvent.subscribe(
            (auth) => {
                this.auth = auth;
            }
        );
    }

    returnWidth(){
        return window.innerWidth;
    }

    setAllStates() {
        this.getAthorizationData();
        this.utilitiesService.downloadProducts(false);
        this.utilitiesService.headerState2(false);
    }

    listenerStates() {
        this.checkAuthorization();
    }

    checkIfIsLoading() {
        setTimeout(() => {
            this.isLoading = false;
        }, 1000);
    }

    // favorites
    toogleProductFavorites(product, event) {
        event.preventDefault();
        event.stopPropagation();
        if (product.isFavorite && product.isFavorite > 0) {
            this.deleteProductFavorites(product);
        } else {
            this.addProductFavorites(product);
        }
    }

    addProductFavorites(product) {
        this.closedApi.addProductToFavorites(product.id).
        subscribe(success => {
            if (success['error'] === 0) {
                product['isFavorite'] = 1;
            } else {
                product['isFavorite'] = null;
                this.setError(success);
            }
        }, err => {
            this.setError(null, err);
        });
    }

    deleteProductFavorites(product) {
        this.closedApi.deleteProductFromFavorites(product.id)
            .subscribe(success => {
                if (success.error == 0) {
                    product.isFavorite = null;
                } else {
                    product.isFavorite = 1;
                    this.setError(success);
                }
            }, err => {
                this.setError(null, err);
            });
    }

    // cart func
    addProductCart(product) {
        this.disableBTN = true;
        this.closedApi.addItemToCart(product.id, 1).pipe(
            takeUntil(this.destroyStream$)
        ).subscribe(
          r=>{
              if(r.error === 0){
              product.quantity = 1;
              this.sessionStorage.setItem('totalAmount', `${Number(this.sessionStorage.getItem('totalAmount')) + 1}`);
              } else {
                  let id = 0;
                  if(this.errorsService.errorsArray.length > 0 && this.errorsService.errorsArray[this.errorsService.errorsArray.length - 1]){
                      id = this.errorsService.errorsArray[this.errorsService.errorsArray.length - 1].errorID + 1;
                  }
                  let error: Error = {
                      errorMessage: r.message,
                      errorType: ERRORSTYPES.DEFAULT,
                      errorCode: r.error,
                      errorID: id
                  }
                  this.errorsService.setErrors(error);
              }
              this.disableBTN = false;
          },
          (e:HttpErrorResponse)=>{
              let id = 0;
              if(this.errorsService.errorsArray.length > 0 && this.errorsService.errorsArray[this.errorsService.errorsArray.length - 1]){
                id = this.errorsService.errorsArray[this.errorsService.errorsArray.length - 1].errorID + 1;
              }
              let error: Error = {
                errorMessage: e.error.message,
                errorType: ERRORSTYPES.DEFAULT,
                errorCode: e.status,
                errorID: id
              }
              this.errorsService.setErrors(error);
              this.disableBTN = false;
          }
        )
    }

    // округление
    roundTo(num, num2) {
        return Math.ceil(num / num2) * num2;
    }

    changeProductCart(type, product) {
        let count: number;
        if(type){
            count = product.quantity + 1;
        } else {
            count = product.quantity - 1;
        }
        this.updateCartCount(product.id, count, false, product)
    }

    updateCartCount(product_id:number, quantity:number, inc:boolean, product){
        this.disableBTN = true;
        this.closedApi.updateProductCount(product_id,quantity,inc).pipe(
            takeUntil(this.destroyStream$)
        ).subscribe(
            r=>{
                if(r.error === 0){
                    product.quantity = r.quantity
                } else {
                    let id = 0;
                    if(this.errorsService.errorsArray.length > 0 && this.errorsService.errorsArray[this.errorsService.errorsArray.length - 1]){
                        id = this.errorsService.errorsArray[this.errorsService.errorsArray.length - 1].errorID + 1;
                    }
                    let error: Error = {
                        errorMessage: r.message,
                        errorType: ERRORSTYPES.DEFAULT,
                        errorCode: r.error,
                        errorID: id
                    }
                    this.errorsService.setErrors(error);
                }
                this.disableBTN = false;
            },
            (e:HttpErrorResponse) => {
                let id = 0;
                if(this.errorsService.errorsArray.length > 0 && this.errorsService.errorsArray[this.errorsService.errorsArray.length - 1]){
                  id = this.errorsService.errorsArray[this.errorsService.errorsArray.length - 1].errorID + 1;
                }
                let error: Error = {
                  errorMessage: e.error.message,
                  errorType: ERRORSTYPES.DEFAULT,
                  errorCode: e.status,
                  errorID: id
                }
                this.errorsService.setErrors(error);
                this.disableBTN = false;
            }
        )
      }

    removeProductCart(product) {
        this.disableBTN = true;
        this.closedApi.deleteProductCart(product.id).pipe(
        takeUntil(this.destroyStream$)
        ).subscribe(
            r=>{
                if(r.error === 0){
                    product.quantity = 0;
                    this.sessionStorage.setItem('totalAmount', `${Number(this.sessionStorage.getItem('totalAmount')) - 1}`);
                } else {
                    let id = 0;
                    if(this.errorsService.errorsArray.length > 0 && this.errorsService.errorsArray[this.errorsService.errorsArray.length - 1]){
                    id = this.errorsService.errorsArray[this.errorsService.errorsArray.length - 1].errorID + 1;
                    }
                    let error: Error = {
                    errorMessage: r.message,
                    errorType: ERRORSTYPES.DEFAULT,
                    errorCode: r.error,
                    errorID: id
                    }
                    this.errorsService.setErrors(error);
                }
                this.disableBTN = false;
            },
            (e:HttpErrorResponse) => {
                let id = 0;
                if(this.errorsService.errorsArray.length > 0 && this.errorsService.errorsArray[this.errorsService.errorsArray.length - 1]){
                id = this.errorsService.errorsArray[this.errorsService.errorsArray.length - 1].errorID + 1;
                }
                let error: Error = {
                errorMessage: e.error.message,
                errorType: ERRORSTYPES.DEFAULT,
                errorCode: e.status,
                errorID: id
                }
                this.errorsService.setErrors(error);
                this.disableBTN = false;
            }
        );
    }

    numberOnly(event): boolean {
        const charCode = (event.which) ? event.which : event.keyCode;
        if (charCode > 31 && (charCode < 48 || charCode > 57)) {
            return false;
        }
        return true;
    }

    inputBlur(product) {
        if (product['quantity'] < product['batchSize'] || product['quantity'] === '') {
            product['quantity'] = product['batchSize'];
        }
        product['quantity'] = this.roundTo(product['quantity'], product['batchSize']);
        if (product['hasAction'] === 1) {
            this.total = parseFloat(product['quantity']) * parseFloat(product['discount']['price']) *  product['unitSize'];
        } else {
            this.total = parseFloat(product['quantity']) * parseFloat(product['price']) *  product['unitSize'];
        }
        this.total = parseFloat(this.total.toFixed(2));
        if (this.batchSize === undefined) {
            if (product['quantity'] > 0) {
                this.batchSize = product['batchSize'];
            }
        }
        this.changeProductCounter = true;
        this.tooltipmessage = 'Продается по ' + this.batchSize + ' ' + product['measure'];
        setTimeout(() => {
            this.tooltipmessage = '';
        }, 1000);
        if (product['quantity'] > product['batchSize']) {
            if (product['hasAction'] === 1 && product['discount']['maxCount']) {
                if (product['quantity'] >= product['discount']['maxCount'] && product['hasAction']) {
                    product['quantity'] = product['discount']['maxCount'];
                    this.total = parseFloat(product['quantity']) * parseFloat(product['discount']['price']) *  product['unitSize'];
                    this.errorMsg = 'Максимальное количество товара по акции ' +
                        String(+(product['discount']['maxCount'] * product['unitSize']).toFixed(3)).replace('.', ',') +
                        ' ' + product['measure'];
                    setTimeout(() => {
                        this.errorMsg = '';
                    }, 3000);
                }
            }
            if (this.auth) {
                this.rest.updateProductCart(product['id'], null, product['quantity']).
                then(addObj => {
                    if (addObj['error'] !== 0) {
                        product['quantity'] = Number(product['quantity']) - product['package'];
                        this.setError(addObj);
                    }
                }, err => {
                    product['quantity'] = Number(product['quantity']) - product['package'];
                    this.setError(null, err);
                });
            }
        }
    }

    goToCat() {
        this.localStorage.removeItem('hash');
        this.localStorage.removeItem('currentPage');
        this.localStorage.setItem('catId', this.catId);
    }

    goToSubCat() {
        this.localStorage.removeItem('hash');
        this.localStorage.removeItem('currentPage');
        this.localStorage.setItem('catId', this.subCatId);
    }
    goToBrand(slug: string) {
        this.localStorage.setItem('catId', this.catId);
        this.localStorage.setItem('brId', this.brId);
    }

    ngOnDestroy() {
        if (this.sub) {
            this.sub.unsubscribe();
        }
        if (this.sub1) {
            this.sub1.unsubscribe();
        }
        if (this.sub2) {
            this.sub2.unsubscribe();
        }
        this.metaService.updateTag({ name: 'description', content: this.prevMetaTag });
    }
}
