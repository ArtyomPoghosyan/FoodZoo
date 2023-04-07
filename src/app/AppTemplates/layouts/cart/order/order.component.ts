import { Component, EventEmitter, Injectable, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { ruLocale } from 'ngx-bootstrap/locale';
import { Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SharedApiService } from '../../../../AppTemplates/services/Portal/shared-api.service';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import { AppLocalStorageService } from '../../../../AppTemplates/services/storages/app-local-storage.service';
import { Router } from '@angular/router';
import { ClosedApiService } from '../../../../AppTemplates/services/Portal/closed-api.service';
import { ErrorsService, ERRORSTYPES, Error } from '../../../../AppTemplates/shared/errors/service/errors.service';
import { HttpErrorResponse } from '@angular/common/http';
import { USER } from '../../../../AppTemplates/models/profile.models';
import { DatePipe } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { YandexMetricaHelperService } from '../../../../AppTemplates/services/helpers/yandex-metrica-helper.service';

defineLocale('ru', ruLocale);
@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss'],
  providers: [DatePipe],
  encapsulation: ViewEncapsulation.None
})
export class OrderComponent implements OnInit {

  public currentDeliveredCityName: string = ""

  @Input() beforeOrderParams: { productCount: number, totalPrice: number } | null = null;
  @Output() backToCart: EventEmitter<any> = new EventEmitter();
  @Output() orderComplete: EventEmitter<boolean> = new EventEmitter();

  form: FormGroup = new FormGroup({
    address: new FormControl('', [Validators.required]),
    delivery_date: new FormControl('', [Validators.required]),
    delivery_time_period: new FormControl('', [Validators.required]),
    comment: new FormControl('', []),
    front_type: new FormControl(1, [])
  })
  nameForm: FormGroup = new FormGroup({
    value: new FormControl('', [Validators.pattern('^[А-Я|а-я|A-Z|a-z|ё|Ё| |-|]+$'), Validators.required])
  })
  phoneForm: FormGroup = new FormGroup({
    value: new FormControl('', [Validators.required, Validators.pattern('^[\(\)a-z0-9-+]+$')])
  })
  today = new Date();
  maxDay = new Date(new Date().setDate(new Date().getDate() + 5));
  scheduler: schedule[] = [];
  scrOut: string[] = [];
  timePeriods: [{ id: number, name: string }] | any = [];
  mask = ['+', '7', '(', /[0-9]/, /\d/, /\d/, ')', /\d/, /\d/, /\d/, '-', /\d/, /\d/, '-', /\d/, /\d/];
  codeMask = [/\d/]
  showConfirm: boolean = false;
  subscribeTimer: number = 60;
  disableds = [false, true, true, true];
  values: string[] = ["", "", "", ""];
  destroyStream$ = new Subject();

  constructor(
    private sharedApi: SharedApiService,
    private localeService: BsLocaleService,
    private localStorage: AppLocalStorageService,
    private closedApi: ClosedApiService,
    private router: Router,
    private errorsService: ErrorsService,
    private titleService: Title,
    private yandexMetrica: YandexMetricaHelperService
  ) { }

  ngOnInit(): void {
    this._getCurrentCity()
    this.updateSeo();
    this.localeService.use('ru');
    this.form.get('delivery_date').setValue(this.today);
    this.checkDeliveryAddres();
    this.getScheduler();
    this.checkUserNameAndPhone();
  }

  private _getCurrentCity() {
    let getCurrentAddress: string = ""
    this.closedApi.getUserData()
      .subscribe(resp => {
        getCurrentAddress = resp.profile.shownAddress.split(",")
        if (getCurrentAddress.length === 2) {
          if (getCurrentAddress[1].includes("Матвеев Курган")) {
            this.currentDeliveredCityName = "Матвеев Курган"
          }
        }
        else if (getCurrentAddress.length === 3) {
          this.currentDeliveredCityName = `г. ${getCurrentAddress[0]}`
        }
        else if (getCurrentAddress.length === 4) {
          this.currentDeliveredCityName = `г. ${getCurrentAddress[0]}`
        }
        else if (getCurrentAddress.length === 5) {
          this.currentDeliveredCityName = getCurrentAddress[1]
        }
        else {
          this.currentDeliveredCityName = getCurrentAddress[2]
        }
      })
  }

  updateSeo() {
    this.titleService.setTitle('Оформление заказа');
  }

  getScheduler() {
    this.closedApi.getSheulder().pipe(
      takeUntil(this.destroyStream$)
    ).subscribe(
      r => {
        if (r.error === 0) {
          let b = Object.entries(r.schedule);
          let a: schedule[] = [];
          for (let i = 0; i < b.length; i++) {
            let c: schedule = { date: b[i][0], value: (b[i][1] as [{ id: number, name: string }]) }
            a.push(c);
          }
          this.scheduler = a;
          this.timePeriods = this.scheduler[0].value
          let datePart = a[0].date.split(".");
          this.today = new Date(new Date(+datePart[2], +datePart[1] - 1, +datePart[0]))
          this.maxDay = new Date(new Date().setDate(new Date(this.today).getDate() + b.length - 1));
          this.form.get('delivery_date').setValue(this.today);
          this.form.get('delivery_time_period').setValue(this.timePeriods[0].id);
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

  checkDeliveryAddres() {
    if (this.localStorage.getItem('UData') && JSON.parse(this.localStorage.getItem('UData')).profile && JSON.parse(this.localStorage.getItem('UData')).profile.deliveryAddress) {
      this.form.get('address').patchValue(JSON.parse(this.localStorage.getItem('UData')).profile.deliveryAddress);
    }
  }

  serchAddresValues() {
    this.sharedApi.getAddress(this.form.value.address).pipe(
      takeUntil(this.destroyStream$)
    ).subscribe(
      (r: any) => {
        if (r.error === 0) {
          this.scrOut = (r.items as string[]);
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

  setAddresToProfile() {
    let value = this.form.value.address;
    if (value.trim().length > 0) {
      this.closedApi.setDeliveryAddress(value).pipe(
        takeUntil(this.destroyStream$)
      ).subscribe(
        r => {
          if (r.error === 0) {
            this.scrOut = [];
            let b = JSON.parse(this.localStorage.getItem('UData'));
            b.profile.deliveryAddress = value;
            this.localStorage.setItem('UData', JSON.stringify(b))
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
  }

  setAddresByItem(item: string) {
    console.log(item)
    this.form.get('address').patchValue(item);
    this.scrOut = [];
  }

  changeDate(event: Date) {
    this.form.get('delivery_time_period').patchValue('');
    let b = this.scheduler.filter(item => item.date === event.toLocaleDateString());
    if (b.length != 0) {
      this.timePeriods = b[0].value;
      this.form.get('delivery_time_period').setValue(this.timePeriods[0].id)
    }
  }

  submit() {
    if (this.returnDisable()) {
      let b = {
        error: 3,
        message: this.returnDisable()
      }
      this.setError(b)
    } else if (this.returnProfileErrors()) {
      let b = {
        error: 3,
        message: this.returnProfileErrors()
      }
      this.setError(b);
    } else if (this.returnNameErrors()) {
      let b = {
        error: 3,
        message: this.returnNameErrors()
      }
      this.setError(b);
    } else {
      let v = this.form.value
      this.closedApi.order(
        new DatePipe('en-US').transform(v.delivery_date, 'dd.MM.yyyy'),
        v.delivery_time_period,
        v.front_type,
        v.comment).pipe(
          takeUntil(this.destroyStream$)
        ).subscribe(
          r => {
            if (r.error === 0) {
              this.yandexMetrica.cartOrderAction();
              this.localStorage.setItem('orderID', r.id);
              this.router.navigate(['/cart/success']);
              this.orderComplete.emit(true);
            } else {
              if (r.error === 3) {
                this.backToCart.emit(true)
              }
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
  }

  returnProfileErrors() {
    let b = JSON.parse(this.localStorage.getItem('UData'));
    if (b && b.profile && b.profile.name === null) {
      return 'Укажите ваше имя в профиле';
    } else if (b && b.profile && b.profile.phone === null) {
      return 'Укажите ваш телефон в профиле';
    } else {
      return false;
    }
  }

  returnDisable() {
    let form = this.form;
    if (form.get('address').invalid) {
      return "Укажите адрес доставки!";
    } else if (form.get('delivery_date').invalid) {
      return "Укажите дату доставки!";
    } else if (form.get('delivery_time_period').invalid) {
      return "Укажите период доставки!";
    } else {
      return false
    }
  }

  ngOnDestroy(): void {
    this.destroyStream$.next(null);
    this.destroyStream$.complete();
  }

  checkConfirmUserPhone() {
    if (this.localStorage.getItem('UData')) {
      let a = JSON.parse(this.localStorage.getItem('UData'));
      let b = this.phoneForm.value.value;
      if (!!a.profile.phone && a.profile.phone !== b && this.phoneForm.valid) {
        let params = {
          type: 'phone',
          value: b
        }
        this.codeEdit(params);
      } else {
        this.checkUserNameAndPhone()
        return
      }
    }
  }

  codeEdit(params: { type: string, value: string }) {
    this.closedApi.sendCode(params).pipe(
      takeUntil(this.destroyStream$)
    ).subscribe(
      (r:any) => {
        if (r.error === 0) {
          this.showConfirm = true;
          this.timer(r.retryDelay)
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

  returnNameErrors() {
    let control = this.nameForm.get('value');
    if (control.hasError('pattern') && control.touched) {
      return "Введите корректное имя"
    } else if (control.hasError('required')) {
      return "Имя обязательно для заполнения"
    } else if (control.value.trim() === "" && control.touched) {
      return "Имя не может состоять из одних пробелов!"
    } else {
      return false;
    }
  }

  changeName() {
    let b: boolean = this.nameForm.value.value == JSON.parse(this.localStorage.getItem('UData')).profile.name;
    if (!this.returnNameErrors() && !b) {
      this.closedApi.cnageName(this.nameForm.value.value).pipe(
        takeUntil(this.destroyStream$)
      ).subscribe(
        r => {
          if (r.error === 0) {
            let b = JSON.parse(this.localStorage.getItem('UData'));
            b.profile.name = this.nameForm.value.value;
            this.localStorage.removeItem('UData');
            this.localStorage.setItem('UData', JSON.stringify(b));
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
    } else {
      return;
    }
  }

  checkUserNameAndPhone() {
    if (this.localStorage.getItem('UData')) {
      let a = JSON.parse(this.localStorage.getItem('UData'));
      if (!!a.profile.name) {
        this.nameForm.get('value').setValue(a.profile.name)
      }
      if (!!a.profile.phone) {
        this.phoneForm.get('value').setValue(a.profile.phone)
      }
    }
  }

  timer(secconds: number) {
    const source = timer(1000, 2000);
    source.pipe(
      takeUntil(this.destroyStream$)
    ).subscribe(val => {
      if (val <= secconds) {
        this.subscribeTimer = secconds - val;
      }
    });
  }

  changeValues(event, idx) {
    let code = event.keyCode;
    let codes = [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 9, 8];
    if (codes.filter(cod => cod == code).length == 0) {
      return
    } else {
      this.values[idx] = event.target.value;
      if (code != 8 && idx != 3) {
        this.disableds[idx + 1] = false;
        this.disableds[idx] = true;
        setTimeout(() => { event.target.nextElementSibling.focus(); }, 20);
      } else if (code == 8 && idx != 0) {
        this.disableds[idx] = true;
        this.disableds[idx - 1] = false;
        setTimeout(() => { event.target.previousElementSibling.focus(); }, 20);
      } else if (code == 8 && this.values[0] == "") {
        return
      } else if (this.values[3] !== "" && idx == 3) {
        this.disableds[idx] = true;
        let type = 'phone';
        let value = this.phoneForm.value.value;
        let code = this.values.join('').trim();
        this.sendCode(type, value, code, event.target, idx)
      }
    }
  }

  sendCode(type, value, code, element, idx) {
    this.closedApi.codeVerificate(type, value, code).pipe(
      takeUntil(this.destroyStream$)
    ).subscribe(
      r => {
        if (r.error === 0) {
          this.profileUpdate(JSON.parse(this.localStorage.getItem('UData')), r);
          this.showConfirm = false;
        } else {
          this.disableds[idx] = false;
          setTimeout(() => { element.focus(); }, 20);
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
        this.disableds[idx] = false;
        setTimeout(() => { element.focus(); }, 20);
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

  profileUpdate(prevData: USER, newData: USER) {
    newData.profile.cartAmount = newData.profile.cartAmount + prevData.profile.cartAmount;
    prevData = newData;
    this.localStorage.setItem('UData', JSON.stringify(prevData));
  }

  closeConfirm() {
    this.disableds = [false, true, true, true];
    this.values = ['', '', '', '',];
    this.showConfirm = false;
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

}

interface schedule {
  date: string,
  value: [
    {
      id: number,
      name: string
    }
  ]
}