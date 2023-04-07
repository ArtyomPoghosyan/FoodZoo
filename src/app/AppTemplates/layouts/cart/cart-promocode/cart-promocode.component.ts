import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, Output, ViewEncapsulation, EventEmitter } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ClosedApiService } from '../../../../AppTemplates/services/Portal/closed-api.service';
import { ErrorsService, ERRORSTYPES, Error } from '../../../../AppTemplates/shared/errors/service/errors.service';

@Component({
  selector: 'app-cart-promocode',
  templateUrl: './cart-promocode.component.html',
  styleUrls: ['./cart-promocode.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CartPromocodeComponent implements OnInit {
  promo:string|null = null
  promoForm = new FormGroup({
    promocode: new FormControl('', [])
  })
  destroyStream$ = new Subject();
  @Output() changeProducts: EventEmitter<any> = new EventEmitter
  constructor(
    private errorsService: ErrorsService,
    private closedApi: ClosedApiService
  ) { }

  ngOnInit(): void {
    this.closedApi.getCart()
    .subscribe(resp=>{
      if(resp.promocode) {
        this.promoForm.patchValue({
          promocode:resp.promocode
        })
      }
      
    })
  }

  addPromocode(){
    this.closedApi.setPromocode(this.promoForm.value.promocode).pipe(
      takeUntil(this.destroyStream$)
    ).subscribe(
      r=>{
        if(r.error === 0){
          this.changeProducts.emit(r.cart.items);
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
      }
    )
  }

  clearPromocode(){
    this.promoForm.get('promocode').setValue('');
    this.addPromocode();
  }

}
