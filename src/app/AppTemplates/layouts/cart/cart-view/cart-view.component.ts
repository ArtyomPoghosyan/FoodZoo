import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { ClosedApiService } from '../../../../AppTemplates/services/Portal/closed-api.service';
import { Product } from '../../../../AppTemplates/models/product.model';
import { takeUntil, map } from 'rxjs/operators';
import { from, fromEvent, Subject } from 'rxjs';
import { AppLocalStorageService } from '../../../../AppTemplates/services/storages/app-local-storage.service';
import { AppSessionStorageService } from '../../../../AppTemplates/services/storages/app-session-storage.service';
import { ErrorsService, ERRORSTYPES, Error } from '../../../../AppTemplates/shared/errors/service/errors.service';
import { HttpErrorResponse } from '@angular/common/http';
import { HelperServiceService } from '../../../../AppTemplates/services/helpers/helper-service.service';
import { RegistrationComponent } from '../../../../AppTemplates/shared/registration/registration.component';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-cart-view',
  templateUrl: './cart-view.component.html',
  styleUrls: ['./cart-view.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CartViewComponent implements OnInit, AfterViewInit {
  @Input() products: Product[];
  @Input() obsolets: Product[];
  @Input() minSum: number | null;
  @Output() cartIsNull: EventEmitter<boolean> = new EventEmitter();
  @Output() OrderProducts: EventEmitter<{ productCount: number, totalPrice: number }> = new EventEmitter();
  @Output() changeProducts: EventEmitter<{ products: Product[] }> = new EventEmitter();

  mobileEnterPromo: boolean = false;
  promocode?: string;
  promoInput = "";
  destroyStream$ = new Subject();
  public isDesktopView: boolean = true;
  constructor(
    private closedApi: ClosedApiService,
    private localStorage: AppLocalStorageService,
    private sessionStorage: AppSessionStorageService,
    private errorsService: ErrorsService,
    private helperService: HelperServiceService,
    private titleService: Title,
  ) { }

  ngOnInit(): void {
    this._checkIsDesktopView();
    this.updateSeo();
  }

  ngAfterViewInit(): void {
    this._handleWindowSizeChanges();
  }

  private _handleWindowSizeChanges(): void {
    fromEvent(window, 'resize')
      .pipe(
        map(() => {
          this._checkIsDesktopView();
        })
      ).subscribe();
  }

  private _checkIsDesktopView(): void {
    if (window.innerWidth > 1200) {
      this.isDesktopView = true;
    } else {
      this.isDesktopView = false;
    }
  }

  updateSeo() {
    this.titleService.setTitle('Корзина');
  }

  deleteFromCart(event) {
    if (this.products && this.products.filter(item => item.id == event).length > 0) {
      this.products = this.products.filter(item => item.id !== event)
      if (this.products.length < 1) {
        this.cartIsNull.emit(true);
      }
    } else if (this.obsolets && this.obsolets.filter(item => item.id == event).length > 0) {
      this.obsolets = this.obsolets.filter(item => item.id !== event)
    }
  }

  returnProductTotalPrice() {
    let price = 0;
    for (let i = 0; i < this.products.length; i++) {
      if (this.products[i].discount) {
        price = price + (this.products[i].discount.price * this.products[i].quantity * this.products[i].unitSize)
      }
      else {
        price = price + (this.products[i].price * this.products[i].quantity * this.products[i].unitSize)
      }
    }
    return Math.round(parseFloat(price as any) * 100) / 100;
  }

  returnProductsLength() {
    return this.products.length
  }

  returnWidth() {
    if (window && window.innerWidth > 1205) {
      return false;
    } else {
      return true;
    }
  }

  tooglePromo() {
    if (this.promocode) {
      this.promocode = undefined;
    } else {
      this.mobileEnterPromo = !this.mobileEnterPromo;
    }
  }

  addPromocode() {
    this.closedApi.setPromocode(this.promoInput).pipe(
      takeUntil(this.destroyStream$)
    ).subscribe(
      r => {
        if (r.error === 0) {
          this.changeProducts.emit(r.cart.items);
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

  clearPromocode() {
    this.promoInput = "";
    this.addPromocode();
  }

  pushProductshWithPromocode(event) {
    this.changeProducts.emit(event);
  }

  clearCart() {
    this.closedApi.clearCart().pipe(
      takeUntil(this.destroyStream$)
    ).subscribe(
      r => {
        let b = JSON.parse(this.localStorage.getItem('UData'));
        b.profile.cartAmount = 0;
        this.localStorage.setItem('UData', JSON.stringify(b));
        this.sessionStorage.setItem('totalAmount', `${0}`);
        this.products = [];
        this.cartIsNull.emit(true);
      },
      e => { console.log(e.status); }
    )
  }

  returnPercents(total: number, min: number) {
    let percent: any = total / (min / 100);
    if (percent < 100) {
      return Math.round(parseFloat(percent) * 100) / 100;
    } else {
      return 100;
    }
  }

  setError(r: any, e?: HttpErrorResponse) {
    let id = 0;
    if (this.errorsService.errorsArray.length > 0 && this.errorsService.errorsArray[this.errorsService.errorsArray.length - 1]) {
      id = this.errorsService.errorsArray[this.errorsService.errorsArray.length - 1].errorID + 1;
    }
    if (e) {
      let error: Error = {
        errorMessage: e.error.message,
        errorType: ERRORSTYPES.DEFAULT,
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

  goToOrder() {
    let user = JSON.parse(this.localStorage.getItem('UData')).profile
    let r = {
      message: "Не набрана минимальная сумма заказа",
      error: 2,
      errorType: ERRORSTYPES.DEFAULT,
      errorID: 0
    }
    if (this.obsolets && this.obsolets.length > 0) {
      r.message = "Некоторые товары распроданы";
      r.error = 2;
      this.setError(r);
    } else if (this.returnProductTotalPrice() < this.minSum) {
      r.message = "Не набрана минимальная сумма заказа";
      this.setError(r);
    } else if (user.phone == null && user.email == null) {
      this.helperService._open(RegistrationComponent);
    } else {
      this.OrderProducts.emit({ productCount: this.products.length, totalPrice: this.returnProductTotalPrice() })
    }
  }

  ngOnDestroy() {
    this.destroyStream$.next(null);
    this.destroyStream$.complete();
  }

  public u(){

  }


}
