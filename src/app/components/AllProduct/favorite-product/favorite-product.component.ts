import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from "@angular/core";
import { Subject } from "rxjs";
import { finalize, takeUntil } from "rxjs/operators";
import { ErrorsService, ERRORSTYPES, Error } from "../../../../app/AppTemplates/shared/errors/service/errors.service";
import { ClosedApiService } from "../../../../app/AppTemplates/services/Portal/closed-api.service";
import { ProductsListService } from '../../../services/ProductsList/products-list.service';
import { HttpErrorResponse } from "@angular/common/http";
import { AllProductService } from "../all-product.service";
import { AppLocalStorageService } from "../../../../app/AppTemplates/services/storages/app-local-storage.service";
import { AppSessionStorageService } from '../../../AppTemplates/services/storages/app-session-storage.service';


@Component({
    selector: "app-favorite-product",
    templateUrl: "./favorite-product.component.html",
    styleUrls: ["./favorite-product.component.scss"]
})
export class FavoriteComponent implements OnInit {

    public filteredProductList: [] = [];
    public destroyStream$ = new Subject();
    public productListViewType:boolean;
    public auth: boolean = false;
    public updateBtnDisable:boolean=false;
    public isShow: boolean = false;

    @ViewChild('countIncrementBtn') private _countIncrementBtn: ElementRef<HTMLElement>;
    @ViewChild('countDecrementBtn') private _countDecrementBtn: ElementRef<HTMLElement>;
    @Output() deleteFromCart: EventEmitter<{ id: number }> = new EventEmitter();

    constructor(
        public ProductsListService: ProductsListService,
        private closedApi: ClosedApiService,
        private errorsService: ErrorsService,
        public allProductService: AllProductService,
        private localStorage: AppLocalStorageService,
        private sessionStorage: AppSessionStorageService,
    ) {

    }

    ngOnInit(): void {
        let searchName=this.localStorage.getItem("searchName")
        this.ProductsListService.getFilteredProductsList(searchName)
            .subscribe((resp: any) => {
                let getProducts: any = Object.values(resp)['7']
                this.filteredProductList = getProducts.filter((item: any) => {
                    return item.isFavorite > 0
                })
            })
            setTimeout(() => {
                this.auth = this.returnAuth();
              }, 2100);
              this._isLoggedProfile();
              this._sortProductViaType()
              this._ShowingProductView()
    }

    public identify(index, item) {
        return item.fullName;
    }

    private _ShowingProductView(){
        this.allProductService.getShowingProductsList()
        .subscribe(resp=>{
          this.productListViewType=resp
        })
      }
  


    public toogleProductFavorites(product, event) {
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

    public addProductFavorites(product) {
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

    public deleteProductFavorites(product) {
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

    public returnProductTotalPrice(product: any) {

        if (product.hasAction > 0 || product?.discount) {
            return Math.round(parseFloat((product.discount.price * product.unitSize * product.quantity) as any) * 100) / 100;
        } else {
            return Math.round(parseFloat((product.price * product.unitSize * product.quantity) as any) * 100) / 100;
        }
    }

    private _sortProductViaType() {
        this.allProductService.getSortedType()
          .subscribe(resp => {
            let searchName = this.localStorage.getItem("searchName")
            this.ProductsListService.getFilteredProductsList(searchName)
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

      returnAuth() {
        if (this.localStorage.getItem('UData') !== (undefined || null)) {
          return true;
        } else {
          return false;
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
    
}