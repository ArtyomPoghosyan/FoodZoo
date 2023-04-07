import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HelperServiceService } from '../../services/helpers/helper-service.service';
import { ClosedApiService } from '../../services/Portal/closed-api.service';
import { AppLocalStorageService } from '../../services/storages/app-local-storage.service';
import { AppSessionStorageService } from '../../services/storages/app-session-storage.service';
import { ErrorsService, Error, ERRORSTYPES } from '../errors/service/errors.service';
import { AuthentificatedService } from './services/auth.service';
import { ReCaptchaV3Service } from 'ngx-captcha';
import { error } from 'console';


@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss'],
  encapsulation: ViewEncapsulation.None
})


export class RegistrationComponent implements OnInit {

  public eventUrl: string;
  public siteKey: any = "6LeJ4rkiAAAAAGADQWTrBfso9AJ7p5OhtHv6C5CT";
  public formGroup: FormGroup;
  public aFormGroup: FormGroup;
  public captchas: any;
  public hcaptchaData: Object;
  enterCode: boolean = false;
  senderInfo?: { url: string, value: string }
  sendFormResponce?: { error?: number, isNew?: number, message?: string, retryDelay?: number, timeout?: number };
  sendCodeError?: string;
  destroyStream$ = new Subject();

  constructor(
    private localStorage: AppLocalStorageService,
    private sessionStorage: AppSessionStorageService,
    private authentificatedService: AuthentificatedService,
    private readonly modalService: NgbModal,
    private errorsService: ErrorsService,
    public router: Router,
    private _fb: FormBuilder,
    private closedApiService: ClosedApiService,
    private _reCaptchaV3Service: ReCaptchaV3Service
  ) { }

  public captcha: boolean;
  public isShowCaptcha: boolean = true;
  public selectedEvent: any

  ngOnInit(): void {
    this._formInt();
    this._reCaptchaV3Service.execute(this.siteKey, 'homepage', (token) => {
      console.log('This is your token: ', token);
    }, {
      useGlobalDomain: false
    });
  }

  public onSubmit() { }

  public onVerify(event: string): void {
    if (event) {
      const data = {
        'h-captcha-response': event
      }
      this.closedApiService.sendWidgetToken(data)
        .subscribe((resp) => {
          this.hcaptchaData = resp
        },
          error => { console.log(error) }
        )
      this.captcha = true;
    }
  }

  public onExpired(event) { }

  public onError(event) { }

  public handleSuccess(event): void {
    if (event) {
      this.captcha = true
    }
  }

  public recieveData(event: boolean): void {
    this.isShowCaptcha = event;
  }

  public backToRegistr(event: boolean): void {
    this.isShowCaptcha = event
    this.captcha = false
  }

  private _formInt(): void {
    this.aFormGroup = this._fb.group({
      recaptcha: ['', Validators.required]
    })
  }

  sendForm(event: { url: string, value: string }) {
    const data = {
      "dest": null,
      "access_token": this.hcaptchaData['access_token']
    }
    switch (event.url) {
      case "phone":
        data.dest = event.value;

        this.closedApiService.sendTokenToPhone(data)
          .subscribe(_ => { })
        // this.authentificatedService.sendTokenToPhone(data)
        //   .subscribe(r => { })
        break
      case "email":
        data.dest = event.value;
        // this.authentificatedService.sendTokenToEmail(data)
        //   .subscribe(r => {console.log(r);
          //  })
        this.closedApiService.sendTokenToEmail(data)
          .subscribe(_ => { })
        break
    }

    // this.eventUrl = event.url
    // this.authentificatedService.sendCode({ type: event.url, value: event.value }).pipe(
    //   takeUntil(this.destroyStream$)
    // ).subscribe(
    //   r => {
    //     if (r.error == 0) {
    //       this.sendFormResponce = r;
          this.senderInfo = event;
    //     } else {
    //       let id = 0;
    //       if (this.errorsService.errorsArray.length > 0 && this.errorsService.errorsArray[this.errorsService.errorsArray.length - 1]) {
    //         id = this.errorsService.errorsArray[this.errorsService.errorsArray.length - 1].errorID + 1;
    //       }
    //       let error: Error = {
    //         errorMessage: r.message,
    //         errorType: ERRORSTYPES.DEFAULT,
    //         errorCode: r.error,
    //         errorID: id
    //       }
    //       this.errorsService.setErrors(error);
    //     }
    //   },
    //   (e: HttpErrorResponse) => {
    //     let id = 0;
    //     if (this.errorsService.errorsArray.length > 0 && this.errorsService.errorsArray[this.errorsService.errorsArray.length - 1]) {
    //       id = this.errorsService.errorsArray[this.errorsService.errorsArray.length - 1].errorID + 1;
    //     }
    //     let error: Error = {
    //       errorMessage: e.error.message,
    //       errorType: ERRORSTYPES.DEFAULT,
    //       errorCode: e.status,
    //       errorID: id
    //     }
    //     this.errorsService.setErrors(error);
    //   }
    // )
    this.senderInfo = event;
    this.enterCode = true;
  }

  skip(event: any) {
    if (this.localStorage.getItem('UData') && JSON.parse(this.localStorage.getItem('UData')).profile.id) {
      this.modalService.dismissAll();
    } else {
      this.authentificatedService.skipAuth().pipe(
        takeUntil(this.destroyStream$)
      ).subscribe(
        r => {
          if (r.error === 0) {
            this.localStorage.setItem('UData', JSON.stringify(r))
            this.modalService.dismissAll();
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

  sendCode(event) {
    let type = this.senderInfo.url;
    let value = this.senderInfo.value;
    let code = event;
    this.authentificatedService.codeVerificate(type, value, code).pipe(
      takeUntil(this.destroyStream$)
    ).subscribe(
      r => {
        let b: any = r;
        if (b.error === 0) {
          this.localStorage.setItem('UData', JSON.stringify(r))
          this.sessionStorage.setItem('totalAmount', `${r.profile.cartAmount}`);
          this.modalService.dismissAll();
          if (this.router.url == "/profile") {
            this.authentificatedService.updateProfile.emit(true);
          }
          if (b.cartIsChanged) {
            this.updateCartData(b);
          } else {
            if (this.router.url === '/cart') {
              this.authentificatedService.goToOrder.emit(true);
            }
          }
        } else {
          this.authentificatedService.confirmValue = '';
          this.sendCodeError = b.message
          let id = 0;
          if (this.errorsService.errorsArray.length > 0 && this.errorsService.errorsArray[this.errorsService.errorsArray.length - 1]) {
            id = this.errorsService.errorsArray[this.errorsService.errorsArray.length - 1].errorID + 1;
          }
          let error: Error = {
            errorMessage: b.message,
            errorType: ERRORSTYPES.DEFAULT,
            errorCode: b.error,
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
      }
    )
  }

  updateCartData(response: any) {
    if (this.router.url === '/cart') {
      this.authentificatedService.cartUpdate.emit(true);
    }
    let id = 0;
    if (this.errorsService.errorsArray.length > 0 && this.errorsService.errorsArray[this.errorsService.errorsArray.length - 1]) {
      id = this.errorsService.errorsArray[this.errorsService.errorsArray.length - 1].errorID + 1;
    }
    let error: Error = {
      errorMessage: response.message,
      errorType: ERRORSTYPES.WARNING,
      errorCode: 3,
      errorID: id
    }
    this.errorsService.setErrors(error);
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
