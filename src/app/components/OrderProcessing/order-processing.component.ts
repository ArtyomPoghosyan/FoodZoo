import {Component, OnInit, VERSION, ViewChild, ElementRef, OnDestroy, ViewEncapsulation} from '@angular/core';

import { UtilitesService } from '../../services/utilites.service';
import { ActivatedRoute, Router } from '@angular/router';
import { RestApiService } from '../../services/rest-api.service';
import { finalize } from 'rxjs/operators';
import { DatePipe } from '@angular/common';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { ruLocale } from 'ngx-bootstrap/locale';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import { HelperServiceService } from '../../AppTemplates/services/helpers/helper-service.service';
import { ErrorsService, Error, ERRORSTYPES } from '../../AppTemplates/shared/errors/service/errors.service';
import { HttpErrorResponse } from '@angular/common/http';

defineLocale('ru', ruLocale);

@Component({
  selector: 'app-order-processing',
  templateUrl: './order-processing.component.html',
  styleUrls: ['./order-processing.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class OrderProcessingComponent implements OnInit, OnDestroy {
 
  // authorize
  userData: any;
  userRole: string;
  userCustomer: boolean;
  auth_token: string;
  auth: boolean;
  locale = 'ru';

  //---------------
  editOrder: boolean = false;
  orderDateCreate: any;
  dateDeliver: any;
  orderDateDeliver: any;
  oldDeliveryDate: any;
  newDeliveryDate: any;
  public currentDate: Date;
  public currentDateD: any;
  oldProductPrice: number;
  private sub: any;
  private sub2: any;
  id: number;
  isLoading: boolean = true;
  deliveryNone: boolean = false;
  addCartProductId: number;
  tooltipmessage: string;
  totalPrice: any;
  orderres: any = [];
  order: any = [];
  exelLink: string;
  selectReason: string;
  @ViewChild('modalCancelOrder') private modalCancelOrder;
  closeResult: string;
  modalReference: any;
  reasons: any = [];
  reason: any = {
    reason: ''
  };
  status: any = {
    status: 0
  };
  changeProductsList: any = [];
  deleteProductsList: any = [];
  body: any = {};
  version = VERSION.full;
  hasMessage: string;
  oneTime: boolean;
  constructor(
    private errorsService: ErrorsService,
    public helperService: HelperServiceService,
    private _datePipe: DatePipe,
    private utilitiesService: UtilitesService,
    private route: ActivatedRoute,
    public rest: RestApiService,
    private localeService: BsLocaleService,
    private modalService: NgbModal,
    private router: Router) { }

  ngOnInit() {
    this.setAllStates();
    this.getAthorizationData();
    this.checkAutorization();
    this.getOrderReasons();
    this.sub = this.route.params.subscribe(params => {
      this.id = +this.route.snapshot.paramMap.get('id');
      this.getOrder(this.id);
      this.localeService.use(this.locale);
    });
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

  editOrderFunc(bool) {
    this.editOrder = bool;
    if (!bool) {
      this.isLoading = false;
      this.body = [];
      this.changeProductsList = [];
      this.deleteProductsList = [];
      this.newDeliveryDate = null;
      this.deliveryNone = false;
      this.getOrder(this.id);
    }
  }

  getAthorizationData() {
    if (localStorage.getItem('userData')) {
      this.userData = localStorage.getItem('userData');
      this.userData = JSON.parse(this.userData);
      this.auth_token = this.userData['auth_token'];
      if (this.auth_token) {
        this.auth = true;
        if (localStorage.getItem('confirmEmail')) {
          this.rest.setAuthorizationTokenBearer(this.auth_token);
        } else {
          this.rest.setAuthorizationToken(this.auth_token);
        }
      } else {
        this.auth = false;
      }
      if (this.userData.role == 2) {
        this.userCustomer = true;
        this.utilitiesService.checkAuthorization(false);
        this.router.navigate(['/login']);
      } else {
        this.userCustomer = false;

      }
    } else {
      this.auth = false;
      this.router.navigate(['/login']);
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

  setAllStates() {
    this.utilitiesService.downloadProducts(false);
    this.utilitiesService.headerState2(true);
    this.utilitiesService.headerStateOrder(true);
  }

  getOrder(id) {
    this.rest.getOrder(id).pipe(
      finalize(() => this.checkIfIsLoading()),
    )
      .subscribe(order => {
        if(order['error'] !== 0){
          this.setError(order);
        }
        this.order = [];
        if (order['status'] > 0) {
          this.router.navigate(['/history-orders']);
        }
        order['products'].forEach(product => {
          product['maxvalue'] = product['quantity'];
        });
        for (var key in order) {
          this.orderres[key] = order[key];
        }
        this.order = order;
        this.orderDateCreate = this.order['created_at'];
        this.dateDeliver = this.order['delivery_date'];
        const deliveryDate = this.order['delivery_date'];
        const pattern = /(\d{2})\.(\d{2})\.(\d{4})/;
        this.orderDateDeliver = new Date(deliveryDate.replace(pattern, '$3-$2-$1'));
        this.currentDate = new Date(deliveryDate.replace(pattern, '$3-$2-$1'));
        this.orderDateDeliver = new Date(deliveryDate.replace(pattern, '$3-$2-$1'));
        this.currentDate.setDate(this.currentDate.getDate());
        this.orderDateDeliver.setDate(this.orderDateDeliver.getDate());
        this.oldDeliveryDate = this._datePipe.transform(this.orderDateDeliver, 'dd.MM.yyyy');
        this.totalPrice = this.order['amount'];

        
      }, err => {
        this.setError(null, err);
        if (err['status'] == 404) {
          this.router.navigate(['/404']);
        }
      });
  }
  getOrderReasons() {
    this.rest.getOrderReasons().pipe(
      finalize(() => this.checkIfIsLoading()),
    )
      .subscribe(reasons => {
        if (reasons['error'] == 0) {
          for (var key in reasons['statuses']) {
            this.reasons = [... this.reasons, { id: key, name: reasons['statuses'][key] }];
          }
        } else {
          this.setError(reasons);
        }
      }, err => {
        this.setError(null, err);
      });
  }
  getOrderExel(id) {
    this.rest.getOrderExel(id).pipe(
      finalize(() => this.checkIfIsLoading()),
    )
      .subscribe(link => {
        const linkSource = String(link) + '\n';
        const downloadLink = document.createElement('a');
        const fileName = 'order-' + this.id + '.xlsx';
        downloadLink.href = linkSource;
        downloadLink.download = fileName;
        downloadLink.click();
        if(link['error'] !== 0){
          this.setError(link);
        }
      }, err => {
        this.setError(null, err);
      });
  }

  setOrder(type) {
    this.oneTime = true;
    this.body = {};
    if (type) {
      this.body['status'] = 4;
      if (this.changeProductsList.length > 0) {
        this.body['changeProducts'] = this.changeProductsList;
        this.body['status'] = 6;
      }
      if (this.deleteProductsList.length > 0) {
        this.body['deleteProducts'] = this.deleteProductsList;
      }
      if (!!this.newDeliveryDate && (this.oldDeliveryDate !== this.newDeliveryDate)) {
        if (this.orderDateDeliver == '') {
          this.deliveryNone = true;
        } else {
          this.deliveryNone = false;
        }
        this.body['delivery_date'] = this.newDeliveryDate;
        this.body['status'] = 6;

      }
    } else {
      this.body['status'] = 1;
      this.body['reason'] = this.selectReason;
    }

    if (!this.deliveryNone) {
      this.rest.setOrder(this.id, JSON.stringify(this.body)).pipe(
        finalize(() => this.checkIfIsLoading()),
      )
        .subscribe(res => {
          if (res['error'] == 0) {
            if(this.modalReference){
              this.modalReference.close();
            }
            this.hasMessage = res['message'];
            const totalCart = Number(sessionStorage.getItem('totalAmount')) - 1;
            this.helperService._totalCartEvent.emit(totalCart);
            setTimeout(() => {
              this.router.navigate(['/history-orders']);
            }, 1000);
          } else {
            this.setError(res);
          }
        }, err => {
          this.setError(null, err);
        });
    }
  }

  changeProductCart(type, product, event) {
    if (this.auth) {
      this.addCartProductId = product['product_id'];
      this.tooltipmessage = '';
      let productChangeExists = false;
      if (type) {
        if (product['quantity'] < product['maxvalue']) {
          product['quantity'] = Number(product['quantity']) + product['batchSize'];
          product['quantity'] = this.roundTo(product['quantity'], product['batchSize']);
          this.tooltipmessage = 'Добавлено ' +
              String(+(product['offers'][0]['batchSize'] * product['offers'][0]['unitSize']).toFixed(3)).replace('.', ',') +
              ' ' + product['measure'];
          setTimeout(() => {
              this.tooltipmessage = '';
          }, 1000);
        }
      } else {
        if (product['quantity'] > product['minOrderAmount']) {
          product['quantity'] = Number(product['quantity']) - product['batchSize'];
          product['quantity'] = this.roundTo(product['quantity'], product['batchSize']);
          this.tooltipmessage = 'Удалено ' +
              String(+(product['batchSize'] * product['unitSize']).toFixed(3)).replace('.', ',') +
              ' ' + product['measure'];
          setTimeout(() => {
              this.tooltipmessage = '';
          }, 1000);
        }
      }
      product['amount'] = product['quantity'] * product['price'];
      product['amount'] = Number(product['amount'].toFixed(2));
      this.totalPrice = 0;
      this.order['products'].forEach(element => {
        this.totalPrice = Number(this.totalPrice) + Number(element['amount'])
        this.totalPrice = this.totalPrice.toFixed(2);
      });
      if (this.changeProductsList.length > 0) {
        this.changeProductsList.forEach(prod => {
          if (prod['id'] === product['product_id']) {
            prod['quantity'] = product['quantity'];
            productChangeExists = true;
          }
        });
      }
      if (!productChangeExists) {
        const changeProduct = {
          id: product['product_id'],
          quantity: product['quantity']
        };
        this.changeProductsList.push(changeProduct);
      }
    }
  }

  removeProductOrder(product) {
    if (this.order['products'].length > 1) {
      for (var i = this.order['products'].length - 1; i >= 0; i--) {
        if (this.order['products'][i]['product_id'] === product['product_id']) {
          this.order['products'].splice(i, 1);
          const deleteProduct = {
            id: product['product_id']
          };
          if (this.changeProductsList.length > 0) {
            for (var i = this.changeProductsList.length - 1; i >= 0; i--) {
              if (this.changeProductsList[i]['id'] === product['product_id']) {
                this.changeProductsList.splice(i, 1);
              }
            }
          }
          this.deleteProductsList.push(deleteProduct);
        }
      }
      this.totalPrice = 0;
      this.order['products'].forEach(element => {
        this.totalPrice = Number(this.totalPrice) + Number(element['amount'])
        this.totalPrice = this.totalPrice.toFixed(2);
      });
    }
  }

  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  inputBlur(product) {
    if (product['quantity'] < 12) {
      product['quantity'] = 12;
    }
    if (product['quantity'] > product['maxvalue']) {
      product['quantity'] = product['maxvalue'];
    }
    this.addCartProductId = product['product_id'];
    this.tooltipmessage = 'Продается по ' + product['batchSize'] + ' ' + product['measure'];
    setTimeout(() => {
      this.tooltipmessage = '';
    }, 1000);
    product['quantity'] = this.roundTo(product['quantity'], product['batchSize']);
  }

  // округление
  roundTo(num, num2) {
    return Math.ceil(num / num2) * num2;
  }

  saveExel() {
    this.getOrderExel(this.id);
  }

  cancelOrder() {
    this.modalReference = this.modalService.open(this.modalCancelOrder, { centered: true});
  }

  setDateDelivery(value: Date) {
    this.newDeliveryDate = this._datePipe.transform(value, 'dd.MM.yyyy');
  }

  checkIfIsLoading() {
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
    if (this.sub2) {
      this.sub2.unsubscribe();
    }
    this.utilitiesService.headerStateOrder(false);
  }
}
