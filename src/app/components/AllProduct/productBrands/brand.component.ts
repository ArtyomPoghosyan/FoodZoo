import { AfterContentChecked, AfterViewChecked, AfterViewInit, Component } from "@angular/core";
import {  ElementRef, EventEmitter, OnInit, Output, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { ClosedApiService } from "../../../AppTemplates/services/Portal/closed-api.service";
import { AppService } from "../../../app.service";
import { ProductsListService } from '../../../services/ProductsList/products-list.service';
import { finalize, takeUntil } from "rxjs/operators";
import { Subject } from "rxjs";
import { AppSessionStorageService } from '../../../AppTemplates/services/storages/app-session-storage.service';
import { ErrorsService, Error, ERRORSTYPES } from "../../../AppTemplates/shared/errors/service/errors.service";
import { HttpErrorResponse } from '@angular/common/http';
import { YandexMetricaHelperService } from "../../../AppTemplates/services/helpers/yandex-metrica-helper.service";
import { UtilitesService } from "../../../services/utilites.service";
import { AppLocalStorageService } from "../../../AppTemplates/services/storages/app-local-storage.service";
import { AllProductService } from "../all-product.service";

@Component({
    selector:"app-brand",
    templateUrl:"./brand.component.html",
    styleUrls:["./brand.component.scss","../search-product/search-product.component.scss"]
})
export class BrandComponent implements OnInit {

  public destroyStream$ = new Subject();
  public updateBtnDisable: boolean = false;
  public disable: boolean = false
  public filteredProductList = []
  public isShow: boolean = false;
  public auth: boolean = false;
  public is_favorite: boolean = false;
  public productListViewType:boolean

  @ViewChild('countIncrementBtn') private _countIncrementBtn: ElementRef<HTMLElement>;
  @ViewChild('countDecrementBtn') private _countDecrementBtn: ElementRef<HTMLElement>;
  @Output() deleteFromCart: EventEmitter<{ id: number }> = new EventEmitter();

  constructor(
    public appService: AppService,
    public ProductsListService: ProductsListService,
    public router: Router,
    private closedApi: ClosedApiService,
    private sessionStorage: AppSessionStorageService,
    private errorsService: ErrorsService,
    private yandexMetrica: YandexMetricaHelperService,
    private utilitiesService: UtilitesService,
    public localStorage: AppLocalStorageService,
    public allProductService: AllProductService,
    

  ) { }

  ngOnInit(): void {
    setTimeout(() => {
      this.auth = this.returnAuth();
    }, 2100);
    this._sortProductViaType()
    this._ShowingProductView()
    this.getBrands()
    this.closedApi.reloadBanners.subscribe((resp: any) => {
      this.getBrands()
    })
  }

  public getBrands(){
      this.allProductService.changeData$
      .subscribe(resp=>{
        this.ProductsListService.getProductsMark(resp)
            .subscribe((response:any)=>{
                this.filteredProductList=response.items
            }) 
      })
  }

  private _ShowingProductView(){
    this.allProductService.getShowingProductsList()
    .subscribe(resp=>{
      this.productListViewType=resp
    })
  }

  private _sortProductViaType() {
    this.allProductService.getSortedType()
      .subscribe(resp => {
        let brandId = localStorage.getItem("brandId")

        this.ProductsListService.getProductsMark(brandId)
        .subscribe((resp:any)=>{
            this.filteredProductList=[...resp.items]
        })

        this.ProductsListService.getProductsMark(brandId)
          .subscribe((response: any) => {
            switch (resp) {
              case 0:
                this._isLoggedProfile()
                break;
              case "price":
                this.filteredProductList = response.items.sort((a, b) => { return a.price - b.price })
                break
              case "-price":
                this.filteredProductList = response.items.sort((a, b) => { return b.price - a.price })
                break
              case "action":
                if (!response?.items?.discount?.percent) {
                  this._isLoggedProfile()
                }
                else {
                  this.filteredProductList = response.items.sort((a, b) => {
                    return b.discount.percent - a.discount.percent
                  })
                }
                break
              case "name":
                this.filteredProductList = response.items.sort((a, b) => {
                  return (a["name"] || "").toString().localeCompare((b["name"] || "").toString())
                })
                break

              default:
                this._isLoggedProfile()
                break;
            }
          })
      })
  }

  private _isLoggedProfile(): void {
    if (this.auth) {
      this.closedApi.canGatByToken = true;
      this.ProductsListService.reloadProduct.subscribe(resp => {
        this.ProductsListService.getFilteredProductsList(resp)
          .subscribe((resp: any) => {
            // this.filteredProductList = resp.items
          })
      })
    }
    else {

      this.ProductsListService.reloadProduct.subscribe(resp => {
        this.ProductsListService.getFilteredProductsList(resp)
          .subscribe((resp: any) => {
            // this.filteredProductList = resp.items
          })
      })
    }
  }

  public navigateto(id) {
    this.router.navigate(['/product/', id])
  }

  toogleProductFavorites(product, event) {
    this.closedApi.canGatByToken = true
    event.preventDefault();
    event.stopPropagation();
    if (product.isFavorite === 0 || product.isFavorite == null) {

      product.isFavorite = 1;
      this.addProductFavorites(product);
    } else {

      product.isFavorite = 0;
      this.deleteProductFavorites(product);
    }
  }

  addProductFavorites(product) {
    this.closedApi.canGatByToken = true
    this.closedApi.addProductToFavorites(product.id).pipe(
      takeUntil(this.destroyStream$)
    ).subscribe(r => {
      if (r.error === 0) {
        product.isFavorite = 1;
      } else {
        product.isFavorite = 0;
        let id = 0;
        if (this.errorsService.errorsArray.length > 0 && this.errorsService.errorsArray[this.errorsService.errorsArray.length - 1]) {
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
    }, (e: HttpErrorResponse) => {
      let id = 0;
      if (this.errorsService.errorsArray.length > 0 && this.errorsService.errorsArray[this.errorsService.errorsArray.length - 1]) {
        id = this.errorsService.errorsArray[this.errorsService.errorsArray.length - 1].errorID + 1;
      }
      let error: Error = {
        errorMessage: e.error.message,
        errorType: ERRORSTYPES.DEFAULT,
        errorCode: e.status,
        errorID: id
      }
      this.errorsService.setErrors(error);
    });
  }

  deleteProductFavorites(product) {
    this.closedApi.canGatByToken = true
    this.closedApi.deleteProductFromFavorites(product.id).pipe(
      takeUntil(this.destroyStream$)
    ).subscribe(r => {
      if (r.error === 0) {
        product.isFavorite = 0;
      } else {
        product.isFavorite = 1;
        let id = 0;
        if (this.errorsService.errorsArray.length > 0 && this.errorsService.errorsArray[this.errorsService.errorsArray.length - 1]) {
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
    }, (e: HttpErrorResponse) => {
      let id = 0;
      if (this.errorsService.errorsArray.length > 0 && this.errorsService.errorsArray[this.errorsService.errorsArray.length - 1]) {
        id = this.errorsService.errorsArray[this.errorsService.errorsArray.length - 1].errorID + 1;
      }
      let error: Error = {

        errorMessage: e.error.message,
        errorType: ERRORSTYPES.DEFAULT,
        errorCode: e.status,
        errorID: id
      }
      this.errorsService.setErrors(error);
    });
  }

  addProductCart(product, event, st) {
    this.closedApi.canGatByToken = true
    this.updateBtnDisable = true;
    event.preventDefault();
    event.stopPropagation();
    this.closedApi.addItemToCart(product.id, 1).pipe(
      takeUntil(this.destroyStream$)
    ).subscribe(
      r => {

        if (r.error === 0) {

          product.quantity = 1;
          this.closedApi.reloadBanners.next();
          this.sessionStorage.setItem('totalAmount', `${Number(this.sessionStorage.getItem('totalAmount')) + 1}`);
          this.yandexMetrica.cartAddAction();
        } else {
          let id = 0;
          if (this.errorsService.errorsArray.length > 0 && this.errorsService.errorsArray[this.errorsService.errorsArray.length - 1]) {
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
        this.updateBtnDisable = false;
      },
      (e: HttpErrorResponse) => {
        console.log(e);

        let id = 0;
        if (this.errorsService.errorsArray.length > 0 && this.errorsService.errorsArray[this.errorsService.errorsArray.length - 1]) {
          id = this.errorsService.errorsArray[this.errorsService.errorsArray.length - 1].errorID + 1;
        }
        let error: Error = {
          errorMessage: e.error.message,
          errorType: ERRORSTYPES.DEFAULT,
          errorCode: e.status,
          errorID: id
        }
        this.errorsService.setErrors(error);
        this.updateBtnDisable = false;
      }
    )


  }

  changeProductCart(type, product, event) {
    // event.preventDefault();
    // event.stopPropagation();
    let count: number;
    if (type) {
      count = product.quantity + 1;
    } else {
      count = product.quantity - 1;
    }
    this.updateCartCount(product.id, count, type, product)
  }

  updateCartCount(product_id: number, quantity: number, inc: boolean, product) {
    this.updateBtnDisable = true;
    this.closedApi.updateProductCount(product_id, quantity, inc).pipe(
      takeUntil(this.destroyStream$),
      finalize(() => {
        this.updateBtnDisable = false;
        setTimeout(() => {
          if (inc) {
            this._countIncrementBtn.nativeElement.focus();
          } else {
            this._countDecrementBtn.nativeElement.focus();
          }
        })
      })
    ).subscribe(
      r => {
        if (r.error === 0) {
          product.quantity = r.quantity;
          this.closedApi.reloadBanners.next();

        } else {
          let id = 0;
          if (this.errorsService.errorsArray.length > 0 && this.errorsService.errorsArray[this.errorsService.errorsArray.length - 1]) {
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
      },
      (e: HttpErrorResponse) => {
        let id = 0;
        if (this.errorsService.errorsArray.length > 0 && this.errorsService.errorsArray[this.errorsService.errorsArray.length - 1]) {
          id = this.errorsService.errorsArray[this.errorsService.errorsArray.length - 1].errorID + 1;
        }
        let error: Error = {
          errorMessage: e.error.message,
          errorType: ERRORSTYPES.DEFAULT,
          errorCode: e.status,
          errorID: id
        }
        this.errorsService.setErrors(error);
      }
    )
  }

  preventClick(event) {
    event.preventDefault();
    event.stopPropagation();
  }

  returnProductTotalPrice(product: any) {

    if (product.hasAction > 0 || product?.discount) {
      return Math.round(parseFloat((product.discount.price * product.unitSize * product.quantity) as any) * 100) / 100;
    } else {
      return Math.round(parseFloat((product.price * product.unitSize * product.quantity) as any) * 100) / 100;
    }
  }

  removeProductCart(product, event) {
    this.updateBtnDisable = true;
    event.preventDefault();
    event.stopPropagation();
    this.closedApi.deleteProductCart(product.id).pipe(
      takeUntil(this.destroyStream$)
    ).subscribe(
      r => {
        if (r.error === 0) {
          this.isShow = false
          product.quantity = 0;
          this.sessionStorage.setItem('totalAmount', `${Number(this.sessionStorage.getItem('totalAmount')) - 1}`);
          this.deleteFromCart.emit(product.id)
          this.closedApi.reloadBanners.next();
        } else {
          let id = 0;
          if (this.errorsService.errorsArray.length > 0 && this.errorsService.errorsArray[this.errorsService.errorsArray.length - 1]) {
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
        this.updateBtnDisable = false;
      },
      (e: HttpErrorResponse) => {
        let id = 0;
        if (this.errorsService.errorsArray.length > 0 && this.errorsService.errorsArray[this.errorsService.errorsArray.length - 1]) {
          id = this.errorsService.errorsArray[this.errorsService.errorsArray.length - 1].errorID + 1;
        }
        let error: Error = {
          errorMessage: e.error.message,
          errorType: ERRORSTYPES.DEFAULT,
          errorCode: e.status,
          errorID: id
        }
        this.errorsService.setErrors(error);
        this.updateBtnDisable = false;
      }
    );
  }

  public inputValidator(event: any, product) {
    const pattern = /^[0-9]*$/;

    if (!pattern.test(event.target.value)) {
      event.target.value = event.target.value.replace(/[^0-9]/g, '');
    }
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

  stopEvent(e, st) {
    if (st === true) {
      e.preventDefault();
      e.stopPropagation();
      this.utilitiesService.checkModal(true);
      return;
    }
  }

  returnWidth() {
    if (window.innerWidth > 480) {
      return true
    } else if (window.innerWidth < 480) {
      return false;
    } else {
      return true
    }
  }

  returnAuth() {
    if (this.localStorage.getItem('UData') !== (undefined || null)) {
      return true;
    } else {
      return false;
    }
  }

  returnPath(product) {
    product.hasCensored === true ? [] : []
    if (product.hasCensored) {
      return "";
    } else {
      return `'/product/', ${product?.breadcrumbs[0]?.slug}, ${product?.breadcrumbs[1]?.slug}, ${product?.slug}`;
    }
  }

  exchangeProduct(product, event) {

    this.removeProductCart(product, event);
    setTimeout(() => {
      this.router.navigate([`/category/${product.breadcrumbs[0].slug}/${product.breadcrumbs[1].slug}`])
    }, 150);
  }

  ngOnDestroy() {
    this.destroyStream$.next(null);
    this.destroyStream$.complete();
  }
}