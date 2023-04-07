import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild, ViewEncapsulation, ElementRef, ChangeDetectionStrategy, ChangeDetectorRef, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, Subject, Observable, Subscription } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { UtilitesService } from '../../../services/utilites.service';
import { YandexMetricaHelperService } from '../../services/helpers/yandex-metrica-helper.service';
import { ClosedApiService } from '../../services/Portal/closed-api.service';
import { AppLocalStorageService } from '../../services/storages/app-local-storage.service';
import { AppSessionStorageService } from '../../services/storages/app-session-storage.service';
import { ErrorsService, Error, ERRORSTYPES } from '../errors/service/errors.service';

@Component({
  selector: 'app-product-list-item',
  templateUrl: './product-list-item.component.html',
  styleUrls: ['./product-list-item.component.scss'],
  encapsulation: ViewEncapsulation.None,

})
export class ProductListItemComponent implements OnInit {

  @Input() product: any;
  @Input() disable: boolean = false;
  @Output() deleteFromCart: EventEmitter<{ id: number }> = new EventEmitter();

  errorMsg: string | null = null;
  tooltipmessage: string | null = null;
  addCartProductId: number | null = null;
  check: boolean = true;
  auth: boolean = false;
  destroyStream$ = new Subject();
  updateBtnDisable: boolean = false;
  public isShow: boolean = false;
  public productList = [];


  @ViewChild('countIncrementBtn') private _countIncrementBtn: ElementRef<HTMLElement>;
  @ViewChild('countDecrementBtn') private _countDecrementBtn: ElementRef<HTMLElement>;

  constructor(
    public localStorage: AppLocalStorageService,
    private sessionStorage: AppSessionStorageService,
    private errorsService: ErrorsService,
    private closedApi: ClosedApiService,
    private utilitiesService: UtilitesService,
    private router: Router,
    private yandexMetrica: YandexMetricaHelperService,

  ) { }

  ngOnInit(): void {
    setTimeout(() => {
      this.auth = this.returnAuth();
    }, 2100);
  }

  toogleProductFavorites(product, event) {
    event.preventDefault();
    event.stopPropagation();
    if (product.isFavorite === 0) {
      product.isFavorite = 1;
      this.addProductFavorites(product);
    } else {
      product.isFavorite = 0;
      this.deleteProductFavorites(product);
    }
  }

  addProductFavorites(product) {
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

  preventClick(event) {
    event.preventDefault();
    event.stopPropagation();
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

  addProductCart(product, event, st) {
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

  returnProductTotalPrice(product: any) {

    if (product.hasAction > 0 || product?.discount) {
      return Math.round(parseFloat((product.discount.price * product.unitSize * product.quantity) as any) * 100) / 100;
    } else {
      return Math.round(parseFloat((product.price * product.unitSize * product.quantity) as any) * 100) / 100;
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