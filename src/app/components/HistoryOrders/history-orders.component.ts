import {Component, OnInit, Input, Output, ViewChild, OnDestroy, ViewEncapsulation} from '@angular/core';
import { UtilitesService } from '../../services/utilites.service';
import { ActivatedRoute, Router } from '@angular/router';
import { RestApiService } from '../../services/rest-api.service';
import { DatePipe } from '@angular/common';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import { ignoreElements, finalize, takeUntil } from 'rxjs/operators';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { ruLocale } from 'ngx-bootstrap/locale';
import { Subject } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorsService, Error, ERRORSTYPES } from '../../AppTemplates/shared/errors/service/errors.service';
defineLocale('ru', ruLocale);

@Component({
  selector: 'app-history-orders',
  templateUrl: './history-orders.component.html',
  styleUrls: ['./history-orders.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HistoryOrdersComponent implements OnInit, OnDestroy {
  @Output('items') public items: any;
  @Output('userType') public typeUser: boolean;
  @Output('amount') public amount: number;
  public historyCutomer: number;
  locale:string = 'ru';
  userData: any = null;
  userRole: string|null = null;
  userCustomer: boolean = false;
  auth_token: string|null = null;
  cartProduct: boolean = false;
  auth: boolean = false;
  isLoading: boolean = true;
  isLoadPage: boolean = false;
  page: number = 1;
  downloadStep: number|null = null;
  allpage: number|null = null;
  noDownladMore: boolean = false;
  perPage: number = 20;
  one: any = null;
  two: any = null;
  inh: any = null;
  try_to_send: boolean = false;
  public currentDate: Date;
  public minCurrentDate: Date;
  public orders: any = null;
  public amountOrders: number = 0;
  public totalCart: number = 0;
  public amountO: number|null = null;

  destroyStream$: Subject<any> = new Subject();

  _filterForm:FormGroup = new FormGroup({
      startDate: new FormControl('',[]),
      endDate:  new FormControl('',[])
  });

  constructor(
    private errorsService: ErrorsService,
    private utilitiesService: UtilitesService,
    private route: ActivatedRoute,
    public rest: RestApiService,
    private _fb: FormBuilder,
    private _datePipe: DatePipe,
    private localeService: BsLocaleService,
    private router: Router
  ) { }

  ngOnInit() {
    this.downloadStep = 1;
    this.setAllStates();
    this._formBuilder();
    this.currentDate = new Date();
    this.currentDate.setDate(this.currentDate.getDate());
    this.localeService.use(this.locale);
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

  setAllStates() {
    this.utilitiesService.headerState2(false);
    this.utilitiesService.downloadProducts(false);
    this.getAthorizationData();
    this.checkAutorization();
    if (this.auth) {
      this._getOrdersHistory(this.page, this.perPage);
    }
  }

  getAthorizationData() {
    if (localStorage.getItem('UData')) {
      this.userData = localStorage.getItem('UData');
      this.userData = JSON.parse(this.userData);
      this.auth_token = this.userData['authToken'];
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
      if (this.userData.role === 2) {
        this.historyCutomer = 2;
      } else if (this.userData.role === 3) {
        this.historyCutomer = 3;
      }
    } else {
      this.auth = false;
      this.router.navigate(['/login']);
    }
  }

  checkAutorization() {
   
    this.utilitiesService.authEvent.pipe(
      takeUntil(this.destroyStream$)
    ).subscribe(
      (auth:boolean) => {
        this.auth = auth;
        this.getAthorizationData();
      }, e=>{}
    );
  }

  receiveOrder(event) {
        this.inh = event;
  }

  private _getOrdersHistory(page?: number, perPage?: number, createdAtForm?: string, createdAtTo?: string): void {
    this.amountOrders = 0;
    this.rest.getOrdersHistory(page, perPage, createdAtForm, createdAtTo).pipe(
      takeUntil(this.destroyStream$),
      finalize(() => this.checkIfIsLoading()),
    ).subscribe(data => {
        if(data['error'] !== 0){
          this.setError(data);
        }
        if (Array.isArray(this.inh)) {
           this.orders = this.inh;
        }
        this.allpage = data['pages'];
        if (this.allpage === this.page) {
            this.noDownladMore = true;
        } else {
            this.noDownladMore = false;
        }
        if (this.historyCutomer === 2) {
            this.isLoadPage = true;
            data['items'].forEach((s, index, arr) => {
                this.orders.push(s);
            });
        } else if (this.historyCutomer === 3) {
            this.isLoadPage = true;
            data['items'].forEach((s, index, arr) => {
                this.orders.push(s);
            });
        } else {
            data['items'].forEach((s, index, arr) => {
                this.orders.push(s);
            });
        }
        if (!!this.orders && this.historyCutomer !== 2) {
          this.amountOrders = data['totalDeliveryOrdersAmount'];
        }
      }, e=>{this.setError(null, e)});
  }

    public downloadMore() {
        this.page = this.page + this.downloadStep;
        if (this.allpage >= this.page) {
            this._getOrdersHistory(this.page, this.perPage);
        } else {
            this.noDownladMore = true;
        }
    }

    onChangesForm(): void {
        this._filterForm.valueChanges.pipe(
          takeUntil(this.destroyStream$)
        ).subscribe(val => {
            const fDate = val.startDate;
            const eDate = val.endDate;
            if ((fDate && eDate) && (fDate.getDate() <= eDate.getDate())) {
                this.minCurrentDate = new Date(fDate);
                this.minCurrentDate.setDate(this.minCurrentDate.getDate());
            } else if (fDate) {
                this.minCurrentDate = new Date(fDate);
                this.minCurrentDate.setDate(this.minCurrentDate.getDate());
                this.one = fDate;
                if (eDate) {
                    if (fDate.getMonth() === eDate.getMonth()) {
                        if (fDate.getDate() > eDate.getDate()) {
                            this._filterForm.controls['endDate'].reset();
                            return;
                        }
                    }
                }
            }
            if (this._filterForm.status === 'VALID' && (val.startDate || val.endDate)) {
                this.try_to_send = true;
            } else {
                this.try_to_send = false;
            }
        }, e=>{});
    }

     _formBuilder(): void {
        if (this._filterForm.status !== 'INVALID') {
            this.orders = [];
            let fDate = this._filterForm.value.startDate;
            let eDate = this._filterForm.value.endDate;
            this.isLoading = true;
            this.page = 1;
            if ((fDate && eDate) && (fDate.getDate() <= eDate.getDate())) {
                this.minCurrentDate = new Date(fDate);
                this.minCurrentDate.setDate(this.minCurrentDate.getDate());
                fDate = this._datePipe.transform(fDate, 'dd.MM.yyyy');
                eDate = this._datePipe.transform(eDate, 'dd.MM.yyyy');
                this.handleFilteredEvent(fDate, eDate);
            } else if (fDate) {
                this.minCurrentDate = new Date(fDate);
                this.minCurrentDate.setDate(this.minCurrentDate.getDate());
                this.one = fDate;
                if (eDate) {
                    if (fDate.getDate() > eDate.getDate() && fDate.getMonth() < eDate.getMonth()) {
                        fDate = this._datePipe.transform(fDate, 'dd.MM.yyyy');
                        eDate = this._datePipe.transform(eDate, 'dd.MM.yyyy');
                        this._getOrdersHistory(this.page, this.perPage, fDate, eDate);
                        return;
                    }
                }
                fDate = this._datePipe.transform(fDate, 'dd.MM.yyyy');
                this._getOrdersHistory(this.page, this.perPage, fDate, '');
            } else if (eDate) {
                this.two = eDate;
                eDate = this._datePipe.transform(eDate, 'dd.MM.yyyy');
                this._getOrdersHistory(this.page, this.perPage, '', eDate);
            }
        }
    }

    clear() {
        this.orders = [];
        this.isLoading = true;
        this.page = 1;
        this._filterForm.reset();
        this.minCurrentDate = null;
        this._getOrdersHistory(this.page, this.perPage, '', '');
    }

  public handleFilteredEvent(startDate, endDate): void {
    this.orders = [];
    if ((startDate !== null) || (endDate !== null)) {
      this._getOrdersHistory(this.page, this.perPage, startDate, endDate);
    }
  }

  get filterForm(): FormGroup {
    return this._filterForm;
  }

  checkIfIsLoading() {
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }

  addClass(value?: string) {
    if (value) {
          setTimeout(() => {
              const cl = document.querySelector('.bs-datepicker');
              if (cl) {
                  cl.classList.add('date-pic');
              }
          });
      }
  }

  ngOnDestroy() {
    this.destroyStream$.next(null);
    this.destroyStream$.complete();
  }
}
