import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';


import { GlobalCart } from '../../models/globalCart.model';
import { HelperServiceService } from '../../services/helpers/helper-service.service';
import { ClosedApiService } from '../../services/Portal/closed-api.service';
import { AppLocalStorageService } from '../../services/storages/app-local-storage.service';
import { AppSessionStorageService } from '../../services/storages/app-session-storage.service';
import { ErrorsService, ERRORSTYPES, Error } from '../../shared/errors/service/errors.service';
import { AuthentificatedService } from '../../shared/registration/services/auth.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CartComponent implements OnInit {

  cart?: GlobalCart = undefined;
  loading: boolean = true;
  order:boolean = false;
  cartIsNull:boolean = false;
  beforeOrderParams: {
    productCount:number, 
    totalPrice:number
  }

  destroyStream$ = new Subject();

  constructor(
    private localStorage : AppLocalStorageService,
    private sessionStorage : AppSessionStorageService,
    private helperService: HelperServiceService,
    private closedApi : ClosedApiService,
    public router : Router,
    private errorsService: ErrorsService,
    private authService: AuthentificatedService,
    private titleService: Title,
 
  ) { }

  ngOnInit(): void {
      this.closedApi.getCart().subscribe(resp=>{console.log(resp.promocode)})
    setTimeout(() => {
      this.getCart()
    }, 2000);
    this.authService.cartUpdate.pipe(
      takeUntil(this.destroyStream$)
    ).subscribe(
      r=>{
        if(r === true){
          this.getCart()
        }
      }
    )
    this.authService.goToOrder.pipe(
      takeUntil(this.destroyStream$)
    ).subscribe(
      r=>{
        if(r === true){
          this.order = true;
        }
      }
    )
    this.updateSeo();
  }

  updateSeo() {
    this.titleService.setTitle('Корзина');
  }

  getCart(){
    this.closedApi.getCart().pipe(
      takeUntil(this.destroyStream$)
    ).subscribe(
      r=>{
        this.loading = false;
        if(r.error === 0){
          this.cart = r as GlobalCart;
          if(r.items.length === 0 && r.obsolete.length === 0){
            this.cartIsNull = true;
          }
        } else {
          this.cartIsNull = true;
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
        this.loading = false;
      } 
    )
  }

  goToCategory(){
    this.router.navigate(['/', 'category'])
  }

  nulledCart(){
    this.cartIsNull = !this.cartIsNull;
    this.cart = undefined;
  }

  OrderProducts(event:{productCount:number, totalPrice:number}){
    this.loading = true;
    this.cart = undefined;
    this.closedApi.getCart().pipe(
      takeUntil(this.destroyStream$)
    ).subscribe(
      r=>{
        if(r.error === 0){
          this.cart = r as GlobalCart;
          if(r.items.length === 0 && r.obsolete.length === 0){
            this.cartIsNull = true;
          }
          if(this.canOrder()){
            this.beforeOrderParams = event;
            this.order = !this.order;
          }
        } else {
          this.setError(r);
        }
        setTimeout(() => {
          this.loading = false;
        }, 500);
      },
      (e:HttpErrorResponse)=>{
        this.setError(null, e);
        this.loading = false;
      } 
    )
  }

  clearCart(){
    this.closedApi.clearCart().pipe(
      takeUntil(this.destroyStream$)
    ).subscribe(
      r=>{
        let b = JSON.parse(this.localStorage.getItem('UData'));
        b.profile.cartAmount = 0;
        this.localStorage.setItem('UData', JSON.stringify(b));
        this.sessionStorage.setItem('totalAmount', `${0}`);
        this.cartIsNull = !this.cartIsNull;
        this.cart = undefined;
      },
      e=>{console.log(e.status);}
    )
  }

  canOrder(): boolean {
    let bool = false;
    if(this.returnTotalPrice(this.cart.items)){
      bool = true;
    }
    if(this.cart.obsolete && this.cart.obsolete.length > 0){
      bool = false;
      let r = {
        message: "Некоторые товары распроданы",
        error: 2,
        errorType: ERRORSTYPES.DEFAULT,
        errorID: 0
      }  
      this.setError(r);
    }
    return bool;
  }

  returnTotalPrice(products) : number{
    let i = 0;
    let totalCount = 0;
    while(i<products.length){
      if(products[i].discount && products[i].discount.price){
        totalCount = totalCount + (products[i].discount.price * products[i].quantity * products[i].unitSize);
      } else {
        totalCount = totalCount + (products[i].price * products[i].quantity * products[i].unitSize);
      }
      i++
    }
    return totalCount
  }

  setItemsWithPromocode(event){ 
    this.cart.items = event
  }

  setError(r:any, e?:HttpErrorResponse){
    let id = 0;
    if(this.errorsService.errorsArray.length > 0 && this.errorsService.errorsArray[this.errorsService.errorsArray.length - 1]){
      id = this.errorsService.errorsArray[this.errorsService.errorsArray.length - 1].errorID + 1;
    }
    if(e) {
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

  ngOnDestroy(){
    this.destroyStream$.next(null);
    this.destroyStream$.complete();
  }
}
