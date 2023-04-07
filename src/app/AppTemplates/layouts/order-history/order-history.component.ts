import { join } from 'path';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ErrorsService, Error, ERRORSTYPES } from '../../../AppTemplates/shared/errors/service/errors.service';
import { ClosedApiService, getOrdersHistoryParams, orderHistoryElement, orderHistoryElementProducts } from '../../../AppTemplates/services/Portal/closed-api.service';
import { AppLocalStorageService } from '../../../AppTemplates/services/storages/app-local-storage.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class OrderHistoryComponent implements OnInit {

  initGetOrderParams: getOrdersHistoryParams = {
    is_closed: 0,
    page: 0,
    per_page: 10,
    from_date: undefined,
    to_date: undefined
  }
  orderItems?: orderHistoryElement;
  orderHystoryElementItems: orderHistoryElementProducts | null = null;
  orderHysotyElementOpened: number | null = null;
  destroyStream$ = new Subject();

  constructor(
    private closedApi: ClosedApiService,
    private localStorage: AppLocalStorageService,
    private router: Router,
    private errorsService: ErrorsService
  ) { }

  ngOnInit(): void {
    if (this.localStorage.getItem('UData') && JSON.parse(this.localStorage.getItem('UData')).profile.phone == null || "" || undefined) {
      this.router.navigate(["/notallow"]);
    }
    setTimeout(() => {
      this.getOrdersHystory(this.initGetOrderParams)
    }, 200);
  }

  getOrdersHystory(params: getOrdersHistoryParams) {
    this.closedApi.getOrdersHistory(params).pipe(
      takeUntil(this.destroyStream$)
    ).subscribe(
      r => {
        
        if (r.error === 0) {
          let splitedAddress = r.items.map(item => {
            return item.deliveryAddress.split(",");
          });

          splitedAddress.forEach((elem, item) => {
            let trimedAddress = elem.map(item => {
              return item.trim()
            })

            let getUniqueAddress = new Set(trimedAddress)

            let address:string = ``;
            
            getUniqueAddress.forEach(e => address += ` ${e} `);
            r.items[item].deliveryAddress = address;
          })
          this.orderItems = r;
        } else {
          this.setError(r)
        }
      },
      e => {
        this.setError(null, e);
      }
    )
  }

  cancelOrder(id: number) {
    this.closedApi.orderCancel(id).pipe(
      takeUntil(this.destroyStream$)
    ).subscribe(
      r => {
        if (r.error == 0) {
          let b = this.orderItems.items;
          b = b.filter(item => item.id !== id);
          this.orderItems.items = b;
        } else {
          this.setError(r)
        }
      },
      e => {
        this.setError(null, e);
      }
    )
  }

  getOrderElementsProduct(id: number) {
    if (id === this.orderHysotyElementOpened) {
      this.orderHysotyElementOpened = null;
    } else {
      this.closedApi.getOrderHistoryItemItems(id).subscribe(
        r => {
          if (r.error == 0) {
            this.orderHystoryElementItems = r;
            this.orderHysotyElementOpened = id;
          } else {
            this.setError(r);
          }
        },
        e => {
          this.setError(null, e);
        }
      )
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

  ngOnDestroy() {
    this.destroyStream$.next(null);
    this.destroyStream$.complete();
  }

}
